<?php

namespace App\Http\Controllers;

use App\Models\QuizScore;
use Illuminate\Http\Request;

class QuizScoreController extends Controller {
    public function store(Request $request) {
        $request->validate([
            'score' => 'required|integer',
            'total_questions' => 'required|integer',
            'theme' => 'nullable|string',
            'source' => 'nullable|string',
            'played_at' => 'required|date',
        ]);

        $score = $request->user()->quizScores()->create($request->all());

        // Calcul de points XP gagnés dans le quiz
        $xpGained = $request->score * 20; // 20 XP par bonne réponse
        $user = $request->user();
        $user->increment('xp_points', $xpGained);

        return response()->json([
            'message' => 'Score enregistré avec succès',
            'score' => $score,
            'xp_gained' => $xpGained,
            'total_xp' => $user->xp_points
        ]);
    }
}