<?php

namespace App\Http\Controllers;

use App\Models\Inspiration;
use Illuminate\Http\Request;

class InspirationController extends Controller {
    public function index() {
        // Charge toutes les inspirations publiques avec les détails de l'utilisateur qui l'a créée
        $inspirations = Inspiration::with('user')
            ->where('is_public', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($inspirations);
    }

    public function store(Request $request) {
        $request->validate([
            'content' => 'required|string',
            'verse_reference' => 'nullable|string',
            'verse_text' => 'nullable|string',
            'source' => 'nullable|string',
            'is_public' => 'boolean'
        ]);

        $inspiration = $request->user()->inspirations()->create($request->all());

        // Bonus d'XP pour le partage d'une inspiration
        $user = $request->user();
        $user->increment('xp_points', 30);

        return response()->json(Inspiration::with('user')->find($inspiration->id), 201);
    }

    public function like($id) {
        $inspiration = Inspiration::findOrFail($id);
        $inspiration->increment('likes');
        
        return response()->json([
            'id' => $inspiration->id,
            'likes' => $inspiration->likes
        ]);
    }
}
