<?php

namespace App\Http\Controllers;

use App\Models\FavoriteVerse;
use Illuminate\Http\Request;

class FavoriteVerseController extends Controller {
    public function index(Request $request) {
        return response()->json($request->user()->favoriteVerses()->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request) {
        $request->validate([
            'source' => 'required|string',
            'book' => 'required|string',
            'chapter' => 'required|integer',
            'verse' => 'required|integer',
            'text' => 'required|string',
            'reference' => 'required|string',
        ]);

        $favorite = $request->user()->favoriteVerses()->create($request->all());
        
        // Ajouter des points XP pour la dévotion
        $user = $request->user();
        $user->increment('xp_points', 15);
        $this->updateUserLevel($user);

        return response()->json($favorite, 201);
    }

    public function destroy(Request $request, $id) {
        $favorite = $request->user()->favoriteVerses()->findOrFail($id);
        $favorite->delete();
        return response()->json(['message' => 'Verset retiré des favoris']);
    }

    private function updateUserLevel($user) {
        if ($user->xp_points >= 2000) {
            $user->level = 'Sage Illuminé';
        } elseif ($user->xp_points >= 1000) {
            $user->level = 'Pèlerin Averti';
        } elseif ($user->xp_points >= 400) {
            $user->level = 'Chercheur de Vérité';
        }
        $user->save();
    }
}