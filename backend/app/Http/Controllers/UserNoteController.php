<?php

namespace App\Http\Controllers;

use App\Models\UserNote;
use Illuminate\Http\Request;

class UserNoteController extends Controller {
    public function index(Request $request) {
        return response()->json($request->user()->notes()->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request) {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string',
            'source' => 'nullable|string',
            'reference' => 'nullable|string',
        ]);

        $note = $request->user()->notes()->create($request->all());

        // Récompense XP
        $user = $request->user();
        $user->increment('xp_points', 25); // Écrire des notes stimule la sagesse !
        
        return response()->json($note, 201);
    }

    public function destroy(Request $request, $id) {
        $note = $request->user()->notes()->findOrFail($id);
        $note->delete();
        return response()->json(['message' => 'Note personnelle supprimée']);
    }
}