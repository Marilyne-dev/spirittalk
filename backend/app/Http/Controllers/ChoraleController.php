<?php

namespace App\Http\Controllers;

use App\Events\NouvelleChorale;
use App\Models\Chorale;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChoraleController extends Controller
{
    // Liste toutes les chorales (filtrées par courant si besoin)
    public function index(Request $request)
    {
        $query = Chorale::with('user:id,name,avatar')
            ->withCount('chansons');

        if ($request->courant) {
            $query->where('courant', $request->courant);
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }
        if ($request->search) {
            $query->where('nom', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->latest()->get());
    }

    // Créer une chorale — logo OBLIGATOIRE
    public function store(Request $request)
    {
        $request->validate([
            'nom'         => 'required|string|max:255',
            'courant'     => 'required|in:catholique,evangelique',
            'type'        => 'required|in:chorale,groupe_priere,mouvement',
            'langue'      => 'required|in:langue,francais,mixte',
            'categorie'   => 'required|in:adulte,jeunesse,enfant,mixte',
            'logo'        => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',
            'description' => 'nullable|string',
            'ville'       => 'nullable|string',
        ]);

        // Upload logo
        $logoPath = $request->file('logo')->store('logos_chorales', 'public');
        $logoUrl  = config('app.url') . '/storage/' . $logoPath;

        $chorale = Chorale::create([
            'user_id'     => auth()->id(),
            'nom'         => $request->nom,
            'slug'        => Str::slug($request->nom) . '-' . uniqid(),
            'courant'     => $request->courant,
            'type'        => $request->type,
            'langue'      => $request->langue,
            'categorie'   => $request->categorie,
            'logo_url'    => $logoUrl,
            'description' => $request->description,
            'ville'       => $request->ville,
        ]);

        $chorale->load('user:id,name,avatar');

        // ── Diffusion temps réel Pusher : tout le monde voit la nouvelle chorale ──
        broadcast(new NouvelleChorale($chorale));

        return response()->json($chorale, 201);
    }

    // Détail d'une chorale avec ses chansons
    public function show($id)
    {
        $chorale = Chorale::with(['user:id,name,avatar', 'chansons' => function ($q) {
            $q->latest();
        }])->findOrFail($id);

        return response()->json($chorale);
    }
}