<?php

namespace App\Http\Controllers;

use App\Models\Inspiration;
use Illuminate\Http\Request;
use Pusher\Pusher;

class InspirationController extends Controller {

    private function pusher(): Pusher {
        return new Pusher(
            env('PUSHER_APP_KEY'),
            env('PUSHER_APP_SECRET'),
            env('PUSHER_APP_ID'),
            [
                'cluster' => env('PUSHER_APP_CLUSTER', 'eu'),
                'useTLS' => true,
            ]
        );
    }

    public function index() {
        $inspirations = Inspiration::with(['user', 'comments.user'])
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
            'images' => 'nullable|array',
            'video_url' => 'nullable|string',
            'is_public' => 'boolean'
        ]);

        $inspiration = $request->user()->inspirations()->create($request->all());
        $inspiration->load(['user', 'comments.user']);

        $user = $request->user();
        $user->increment('xp_points', 30);

        // ── Diffusion temps réel du nouveau post ─────────────────────────
        try {
            $this->pusher()->trigger('spirittalk-community', 'new-post', [
                'id' => (string) $inspiration->id,
                'name' => $inspiration->user->name ?? 'Anonyme',
                'username' => $inspiration->user->username ?? 'user',
                'avatar' => $inspiration->user->avatar ?? null,
                'content' => $inspiration->content,
                'religion' => $inspiration->user->religion ?? 'Mixte',
                'likes' => 0,
                'time' => $inspiration->created_at->translatedFormat('d M Y'),
                'images' => $inspiration->images,
                'videoUrl' => $inspiration->video_url,
                'verse_reference' => $inspiration->verse_reference,
                'verse_text' => $inspiration->verse_text,
            ]);
        } catch (\Exception $e) {
            \Log::warning('Pusher broadcast (new-post) failed: ' . $e->getMessage());
        }

        return response()->json($inspiration, 201);
    }

    public function like($id) {
        $inspiration = Inspiration::findOrFail($id);
        $inspiration->increment('likes');

        // ── Diffusion temps réel du like ──────────────────────────────────
        try {
            $this->pusher()->trigger('spirittalk-community', 'post-liked', [
                'postId' => (string) $inspiration->id,
                'likes' => $inspiration->likes,
            ]);
        } catch (\Exception $e) {
            \Log::warning('Pusher broadcast (post-liked) failed: ' . $e->getMessage());
        }

        return response()->json([
            'id' => $inspiration->id,
            'likes' => $inspiration->likes
        ]);
    }

    public function comment(Request $request, $id) {
        $fields = $request->validate([
            'content' => 'required|string',
        ]);

        $inspiration = Inspiration::findOrFail($id);
        $comment = $inspiration->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $fields['content'],
        ]);
        $comment->load('user');

        // ── Diffusion temps réel du commentaire ───────────────────────────
        try {
            $this->pusher()->trigger('spirittalk-community', 'post-commented', [
                'postId' => (string) $inspiration->id,
                'comment' => [
                    'id' => (string) $comment->id,
                    'authorName' => $comment->user->name ?? 'Anonyme',
                    'authorAvatar' => $comment->user->avatar ?? null,
                    'content' => $comment->content,
                    'time' => "À l'instant",
                ],
            ]);
        } catch (\Exception $e) {
            \Log::warning('Pusher broadcast (post-commented) failed: ' . $e->getMessage());
        }

        return response()->json($comment, 201);
    }
}