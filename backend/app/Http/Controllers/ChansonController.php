<?php

namespace App\Http\Controllers;

use App\Events\NouvelleChanson;
use App\Models\Chanson;
use App\Models\Telechargement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ChansonController extends Controller
{
    // Formats audio acceptés (tous les formats)
    const AUDIO_FORMATS = ['mp3','wav','aac','ogg','flac','m4a','wma','opus','amr','aiff','ape','mp4','3gp'];
    const DOC_FORMATS   = ['pdf','jpg','jpeg','png','webp','docx','doc'];

    // ── Chansons d'une chorale ────────────────────────────────────────────
    public function index(Request $request, $choraleId)
    {
        $query = Chanson::where('chorale_id', $choraleId)
            ->with('user:id,name,avatar');

        // Recherche par titre ou paroles
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('titre', 'like', '%' . $request->search . '%')
                  ->orWhere('psaume', 'like', '%' . $request->search . '%')
                  ->orWhere('texte', 'like', '%' . $request->search . '%');
            });
        }

        // Filtre par psaume
        if ($request->psaume) {
            $query->where('psaume', 'like', '%' . $request->psaume . '%');
        }

        return response()->json($query->latest()->get());
    }

    // ── Ajouter une chanson ───────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'chorale_id'   => 'required|exists:chorales,id',
            'titre'        => 'required|string|max:255',
            'type_contenu' => 'required|in:audio,texte,image,priere',
            'psaume'       => 'nullable|string|max:100',
            'texte'        => 'nullable|string',
            'duree'        => 'nullable|string|max:20',
        ]);

        $audioUrl = null;
        $imageUrl = null;
        $format   = null;
        $taille   = null;

        // ── Upload fichier audio (tous formats) ──────────────────────────
        if ($request->hasFile('audio')) {
            $file     = $request->file('audio');
            $format   = strtolower($file->getClientOriginalExtension());
            $taille   = $file->getSize();
            $path     = $file->store('chansons_audio', 'public');
            $audioUrl = config('app.url') . '/storage/' . $path;
        }

        // ── Upload image / partition ──────────────────────────────────────
        if ($request->hasFile('image')) {
            $path     = $request->file('image')->store('chansons_images', 'public');
            $imageUrl = config('app.url') . '/storage/' . $path;
        }

        // ── Enregistrement micro (base64 envoyé depuis le navigateur) ────
        if ($request->audio_base64 && !$audioUrl) {
            $base64 = $request->audio_base64;
            // Détecter le format depuis le data URI (ex: data:audio/webm;base64,...)
            if (preg_match('/^data:audio\/(\w+);base64,/', $base64, $match)) {
                $format   = $match[1];
                $data     = base64_decode(substr($base64, strpos($base64, ',') + 1));
                $filename = 'rec_' . uniqid() . '_' . time() . '.' . $format;
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

        $chanson->load('user:id,name,avatar');

        // ── Diffusion temps réel Pusher : tout le monde voit la nouvelle chanson ──
        broadcast(new NouvelleChanson($chanson));

        return response()->json($chanson, 201);
    }

    // ── Télécharger (avec quota gratuit 3/jour) ───────────────────────────
    public function download(Request $request, $id)
    {
        $chanson = Chanson::findOrFail($id);
        $userId  = auth()->id();
        $today   = now()->toDateString();

        // Compter les téléchargements gratuits du jour
        $countToday = Telechargement::where('user_id', $userId)
            ->where('date_telechargement', $today)
            ->where('est_paye', false)
            ->count();

        if ($countToday >= 3) {
            return response()->json([
                'error'   => 'quota_depasse',
                'message' => 'Vous avez atteint votre limite de 3 téléchargements gratuits par jour. Revenez demain ou payez 200 FCFA pour 5 téléchargements supplémentaires.',
            ], 403);
        }

        // Enregistrer le téléchargement
        Telechargement::create([
            'user_id'             => $userId,
            'chanson_id'          => $id,
            'date_telechargement' => $today,
            'est_paye'            => false,
        ]);

        $chanson->increment('telecharge_count');

        return response()->json([
            'url'     => $chanson->audio_url,
            'titre'   => $chanson->titre,
            'format'  => $chanson->format_fichier ?? 'mp3',
            'restant' => max(0, 3 - $countToday - 1),
        ]);
    }

    // ── Incrémenter le compteur d'écoute ─────────────────────────────────
    public function ecouter($id)
    {
        $chanson = Chanson::findOrFail($id);
        $chanson->increment('ecoute_count');
        return response()->json(['ok' => true]);
    }

    // ── Supprimer une chanson (seulement son créateur) ────────────────────
    public function destroy($id)
    {
        $chanson = Chanson::findOrFail($id);

        if ($chanson->user_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        // Supprimer le fichier audio du stockage
        if ($chanson->audio_url) {
            $path = str_replace(config('app.url') . '/storage/', '', $chanson->audio_url);
            Storage::disk('public')->delete($path);
        }
        if ($chanson->image_url) {
            $path = str_replace(config('app.url') . '/storage/', '', $chanson->image_url);
            Storage::disk('public')->delete($path);
        }

        $chanson->delete();

        return response()->json(['ok' => true]);
    }
}