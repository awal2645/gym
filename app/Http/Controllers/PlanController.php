<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * Get all active plans.
     */
    public function index()
    {
        $plans = Plan::where('active', true)->get();

        return response()->json($plans);
    }

    /**
     * Get a specific plan.
     */
    public function show($id)
    {
        $plan = Plan::where('active', true)->findOrFail($id);

        return response()->json($plan);
    }
}
