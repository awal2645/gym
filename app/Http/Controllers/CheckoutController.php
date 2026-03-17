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
        if (!config('services.paypal.active', true)) {
            return response()->json(['message' => 'PayPal payments are currently unavailable'], 503);
        }

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
            'payment_id' => 'required|string',
            'payer_id' => 'nullable|string',
            'purchase_id' => 'required|exists:purchases,id',
        ]);

        $purchase = Purchase::findOrFail($request->purchase_id);

        // Verify purchase belongs to user
        if ($purchase->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Idempotency: if already completed, return success
        if ($purchase->status === 'completed') {
            return response()->json([
                'message' => 'Payment successful',
                'purchase' => $purchase->fresh()->load('plan'),
            ]);
        }

        try {
            $accessToken = $this->getPayPalAccessToken();
            $baseUrl = $this->getPayPalBaseUrl();

            $response = Http::withToken($accessToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->withBody('{}', 'application/json')
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
                        'purchase' => $purchase->fresh()->load('plan'),
                    ]);
                }

                $purchase->update(['status' => 'failed']);

                return response()->json([
                    'message' => 'Payment not completed',
                ], 400);
            }

            // If order already captured (PayPal auto-capture for some payment methods), mark as success
            $errorBody = $response->json() ?? [];
            $errorStr = json_encode($errorBody);
            if ($response->status() === 422 || $response->status() === 400) {
                if (str_contains(strtolower($errorStr), 'captured') ||
                    str_contains(strtolower($errorStr), 'already') ||
                    str_contains(strtolower($errorStr), 'completed')) {
                    $purchase->update([
                        'status' => 'completed',
                        'paid_at' => $purchase->paid_at ?? now(),
                    ]);

                    return response()->json([
                        'message' => 'Payment successful',
                        'purchase' => $purchase->fresh()->load('plan'),
                    ]);
                }
            }

            // Try to get order status - maybe it was already captured (Pay Later, Card)
            try {
                $getResponse = Http::withToken($accessToken)
                    ->get("{$baseUrl}/v2/checkout/orders/{$request->payment_id}");
                if ($getResponse->successful()) {
                    $orderData = $getResponse->json();
                    if (($orderData['status'] ?? '') === 'COMPLETED') {
                        $purchase->update([
                            'status' => 'completed',
                            'paid_at' => now(),
                        ]);
                        return response()->json([
                            'message' => 'Payment successful',
                            'purchase' => $purchase->fresh()->load('plan'),
                        ]);
                    }
                    if (!empty($orderData['purchase_units'][0]['payments']['captures'][0]['status'])) {
                        $captureStatus = $orderData['purchase_units'][0]['payments']['captures'][0]['status'];
                        if ($captureStatus === 'COMPLETED') {
                            $purchase->update([
                                'status' => 'completed',
                                'paid_at' => now(),
                            ]);
                            return response()->json([
                                'message' => 'Payment successful',
                                'purchase' => $purchase->fresh()->load('plan'),
                            ]);
                        }
                    }
                }
            } catch (\Throwable $e) {
                // Ignore - we'll return the original error
            }

            $purchase->update(['status' => 'failed']);

            \Log::error('PayPal capture failed', [
                'purchase_id' => $purchase->id,
                'payment_id' => $request->payment_id,
                'status' => $response->status(),
                'response' => $errorBody,
            ]);

            $paypalMessage = $errorBody['details'][0]['description'] ?? $errorBody['message'] ?? null;

            return response()->json([
                'message' => 'Error capturing payment',
                'error' => $errorBody,
                'paypal_message' => $paypalMessage,
            ], 500);
        } catch (\Exception $e) {
            \Log::error('PayPal capture error', [
                'purchase_id' => $purchase->id,
                'error' => $e->getMessage(),
            ]);

            $purchase->update(['status' => 'failed']);

            return response()->json([
                'message' => 'Error capturing payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
