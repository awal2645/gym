<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CheckoutController extends Controller
{
    private function getPayPalAccessToken()
    {
        $clientId = config('services.paypal.client_id');
        $clientSecret = config('services.paypal.client_secret');
        $mode = config('services.paypal.mode', 'sandbox');
        $baseUrl = $mode === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';

        $response = Http::asForm()->withBasicAuth($clientId, $clientSecret)
            ->post("{$baseUrl}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ]);

        if ($response->successful()) {
            return $response->json()['access_token'];
        }

        throw new \Exception('Failed to get PayPal access token');
    }

    private function getPayPalBaseUrl()
    {
        $mode = config('services.paypal.mode', 'sandbox');
        return $mode === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';
    }

    /**
     * Create PayPal order.
     */
    public function createOrder(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $plan = Plan::findOrFail($request->plan_id);
        $user = $request->user();

        // Create a pending purchase
        $purchase = Purchase::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'currency' => 'USD',
            'status' => 'pending',
        ]);

        try {
            $accessToken = $this->getPayPalAccessToken();
            $baseUrl = $this->getPayPalBaseUrl();

            $orderData = [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'reference_id' => $purchase->id,
                        'description' => "Purchase: {$plan->name}",
                        'amount' => [
                            'currency_code' => 'USD',
                            'value' => number_format($plan->price, 2, '.', ''),
                        ],
                    ],
                ],
                'application_context' => [
                    'return_url' => config('app.frontend_url') . '/checkout/success?purchase_id=' . $purchase->id,
                    'cancel_url' => config('app.frontend_url') . '/checkout/cancel',
                ],
            ];

            $response = Http::withToken($accessToken)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post("{$baseUrl}/v2/checkout/orders", $orderData);

            if ($response->successful()) {
                $order = $response->json();
                $purchase->update([
                    'paypal_order_id' => $order['id'],
                ]);

                // Get approval URL
                $approvalUrl = collect($order['links'])->firstWhere('rel', 'approve')['href'] ?? null;

                return response()->json([
                    'payment_id' => $order['id'],
                    'approval_url' => $approvalUrl,
                    'purchase_id' => $purchase->id,
                ]);
            }

            return response()->json([
                'message' => 'PayPal error',
                'error' => $response->json(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Capture PayPal payment.
     */
    public function captureOrder(Request $request)
    {
        $request->validate([
            'payment_id' => 'required',
            'payer_id' => 'required',
            'purchase_id' => 'required|exists:purchases,id',
        ]);

        $purchase = Purchase::findOrFail($request->purchase_id);

        // Verify purchase belongs to user
        if ($purchase->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $accessToken = $this->getPayPalAccessToken();
            $baseUrl = $this->getPayPalBaseUrl();

            $response = Http::withToken($accessToken)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post("{$baseUrl}/v2/checkout/orders/{$request->payment_id}/capture");

            if ($response->successful()) {
                $order = $response->json();

                if ($order['status'] === 'COMPLETED') {
                    $purchase->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                    ]);

                    return response()->json([
                        'message' => 'Payment successful',
                        'purchase' => $purchase->load('plan'),
                    ]);
                }

                $purchase->update(['status' => 'failed']);

                return response()->json([
                    'message' => 'Payment not completed',
                ], 400);
            }

            $purchase->update(['status' => 'failed']);

            return response()->json([
                'message' => 'Error capturing payment',
                'error' => $response->json(),
            ], 500);
        } catch (\Exception $e) {
            $purchase->update(['status' => 'failed']);

            return response()->json([
                'message' => 'Error capturing payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
