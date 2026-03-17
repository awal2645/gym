<?php

namespace App\Http\Controllers;

class ConfigController extends Controller
{
    /**
     * Get PayPal config for frontend (client ID is safe to expose).
     */
    public function paypal()
    {
        return response()->json([
            'client_id' => config('services.paypal.client_id'),
            'active' => config('services.paypal.active', true),
        ]);
    }
}
