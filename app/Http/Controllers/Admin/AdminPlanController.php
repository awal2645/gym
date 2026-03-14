<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class AdminPlanController extends Controller
{
    /**
     * Get all plans (admin).
     */
    public function index()
    {
        $plans = Plan::all();

        return response()->json($plans);
    }

    /**
     * Create a new plan.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'active' => 'boolean',
        ]);

        $plan = Plan::create($request->all());

        return response()->json($plan, 201);
    }

    /**
     * Update a plan.
     */
    public function update(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'active' => 'boolean',
        ]);

        $plan->update($request->all());

        return response()->json($plan);
    }

    /**
     * Delete a plan.
     */
    public function destroy($id)
    {
        $plan = Plan::findOrFail($id);
        $plan->delete();

        return response()->json(['message' => 'Plan deleted successfully']);
    }
}
