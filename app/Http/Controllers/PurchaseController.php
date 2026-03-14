<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    /**
     * Get user's purchases.
     */
    public function myPurchases(Request $request)
    {
        $purchases = Purchase::where('user_id', $request->user()->id)
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($purchases);
    }
}
