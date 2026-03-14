<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use Illuminate\Http\Request;

class AdminPurchaseController extends Controller
{
    /**
     * Get all purchases (admin).
     */
    public function index()
    {
        $purchases = Purchase::with(['user', 'plan'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($purchases);
    }
}
