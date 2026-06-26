<?php

namespace App\Http\Controllers;

use App\Models\ReadingPlan;
use App\Models\ReadingProgress;
use Illuminate\Http\Request;

class ReadingPlanController extends Controller {
    public function index(Request $request) {
        $plans = ReadingPlan::all();
        $user = $request->user();

        // Ajoute l'état de progression de l'utilisateur pour chaque plan
        $plansWithProgress = $plans->map(function ($plan) use ($user) {
            $progress = ReadingProgress::where('user_id', $user->id)
                ->where('reading_plan_id', $plan->id)
                ->first();

            return [
                'id' => $plan->id,
                'title' => $plan->title,
                'description' => $plan->description,
                'theme' => $plan->theme,
                'duration_days' => $plan->duration_days,
                'cover_image' => $plan->cover_image,
                'source' => $plan->source,
                'progress' => $progress ? [
                    'current_day' => $progress->current_day,
                    'percentage' => $progress->percentage,
                    'completed' => (bool)$progress->completed
                ] : null
            ];
        });

        return response()->json($plansWithProgress);
    }

    public function updateProgress(Request $request) {
        $request->validate([
            'reading_plan_id' => 'required|exists:reading_plans,id',
            'current_day' => 'required|integer',
            'percentage' => 'required|integer',
            'completed' => 'required|boolean'
        ]);

        $progress = ReadingProgress::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'reading_plan_id' => $request->reading_plan_id
            ],
            [
                'current_day' => $request->current_day,
                'percentage' => $request->percentage,
                'completed' => $request->completed
            ]
        );

        // Bonus XP si complété !
        if ($request->completed) {
            $request->user()->increment('xp_points', 150);
        }

        return response()->json([
            'success' => true,
            'progress' => $progress
        ]);
    }
}