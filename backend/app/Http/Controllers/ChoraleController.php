<?php

namespace App\Http\Controllers;

use App\Models\Chorale;
use App\Models\Chanson;
use App\Models\Telechargement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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
            'nom'        => 'required|string|max:255',
            'courant'    => 'required|in:catholique,evangelique',
            'type'       => 'required|in:chorale,groupe_priere,mouvement',
            'langue'     => 'required|in:langue,francais,mixte',
            'categorie'  => 'required|in:adulte,jeunesse,enfant,mixte',
            'logo'       => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',
            'description'=> 'nullable|string',
            'ville'      => 'nullable|string',
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

        return response()->json($chorale->load('user:id,name,avatar'), 201);
    }

    // Détail d'une chorale avec ses chansons
    public function show($id)
    {
        $chorale = Chorale::with(['user:id,name,avatar', 'chansons' => function($q) {
            $q->latest();
        }])->findOrFail($id);

        return response()->json($chorale);
    }
}

// ── ChansonController ─────────────────────────────────────────────────────

class ChansonController extends Controller
{
    // Formats audio acceptés
    const AUDIO_FORMATS = ['mp3','wav','aac','ogg','flac','m4a','wma','opus','amr','aiff','ape','mp4','3gp'];
    const DOC_FORMATS   = ['pdf','jpg','jpeg','png','webp','docx','doc'];

    // Chansons d'une chorale
    public function index(Request $request, $choraleId)
    {
        $query = Chanson::where('chorale_id', $choraleId);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('titre', 'like', '%' . $request->search . '%')
                  ->orWhere('psaume', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->psaume) {
            $query->where('psaume', 'like', '%' . $request->psaume . '%');
        }

        return response()->json($query->latest()->get());
    }

    // Ajouter une chanson (audio, texte, image ou enregistrement)
    public function store(Request $request)
    {
        $request->validate([
            'chorale_id'    => 'required|exists:chorales,id',
            'titre'         => 'required|string|max:255',
            'type_contenu'  => 'required|in:audio,texte,image,priere',
            'psaume'        => 'nullable|string',
            'texte'         => 'nullable|string',
        ]);

        $audioUrl  = null;
        $imageUrl  = null;
        $format    = null;
        $taille    = null;

        // Upload audio (tous formats)
        if ($request->hasFile('audio')) {
            $file      = $request->file('audio');
            $format    = strtolower($file->getClientOriginalExtension());
            $taille    = $file->getSize();
            $path      = $file->store('chansons_audio', 'public');
            $audioUrl  = config('app.url') . '/storage/' . $path;
        }

        // Upload image (partition)
        if ($request->hasFile('image')) {
            $path     = $request->file('image')->store('chansons_images', 'public');
            $imageUrl = config('app.url') . '/storage/' . $path;
        }

        // Audio en base64 (enregistrement micro direct)
        if ($request->audio_base64) {
            $base64 = $request->audio_base64;
            if (preg_match('/^data:audio\/(\w+);base64,/', $base64, $match)) {
                $format   = $match[1];
                $data     = base64_decode(substr($base64, strpos($base64, ',') + 1));
                $filename = 'rec_' . uniqid() . '.' . $format;
                Storage::disk('public')->put('chansons_audio/' . $filename, $data);
                $audioUrl = config('app.url') . '/storage/chansons_audio/' . $filename;
                $taille   = strlen($data);
            }
        }

        $chanson = Chanson::create([
            'chorale_id'     => $request->chorale_id,
            'user_id'        => auth()->id(),
            'titre'          => $request->titre,
            'psaume'         => $request->psaume,
            'type_contenu'   => $request->type_contenu,
            'audio_url'      => $audioUrl,
            'image_url'      => $imageUrl,
            'texte'          => $request->texte,
            'format_fichier' => $format,
            'taille_fichier' => $taille,
            'duree'          => $request->duree,
        ]);

        return response()->json($chanson, 201);
    }

    // Télécharger une chanson (avec vérification quota gratuit)
    public function download(Request $request, $id)
    {
        $chanson = Chanson::findOrFail($id);
        $userId  = auth()->id();
        $today   = now()->toDateString();

        // Compter les téléchargements du jour
        $countToday = Telechargement::where('user_id', $userId)
            ->where('date_telechargement', $today)
            ->count();

        if ($countToday >= 3) {
            return response()->json([
                'error'   => 'quota_depasse',
                'message' => 'Vous avez atteint votre limite gratuite de 3 téléchargements par jour. Revenez demain ou payez 200 FCFA pour 5 téléchargements supplémentaires.',
            ], 403);
        }

        // Enregistrer le téléchargement
        Telechargement::create([
            'user_id'               => $userId,
            'chanson_id'            => $id,
            'date_telechargement'   => $today,
            'est_paye'              => false,
        ]);

        $chanson->increment('telecharge_count');

        return response()->json([
            'url'     => $chanson->audio_url,
            'titre'   => $chanson->titre,
            'format'  => $chanson->format_fichier,
            'restant' => max(0, 3 - $countToday - 1),
        ]);
    }

    // Incrémenter le compteur d'écoute
    public function ecouter($id)
    {
        $chanson = Chanson::findOrFail($id);
        $chanson->increment('ecoute_count');
        return response()->json(['ok' => true]);
    }
}