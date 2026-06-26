<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;

class FriendshipController extends Controller {
    public function index(Request $request) {
        $user = $request->user();
        $friendships = Friendship::with(['requester', 'addressee'])
            ->where('requester_id', $user->id)
            ->orWhere('addressee_id', $user->id)
            ->get();

        return response()->json($friendships->map(function (Friendship $friendship) use ($user) {
            $other = $friendship->requester_id === $user->id ? $friendship->addressee : $friendship->requester;
            $status = $friendship->status;

            if ($status === 'pending') {
                $status = $friendship->requester_id === $user->id ? 'pending_sent' : 'pending_received';
            }

            return $this->formatFriend($other, $status);
        })->values());
    }

    public function store(Request $request) {
        $fields = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $user = $request->user();
        $targetId = (int) $fields['user_id'];

        if ($targetId === $user->id) {
            return response()->json(['message' => 'Impossible de vous ajouter vous-meme.'], 422);
        }

        $firstId = min($user->id, $targetId);
        $secondId = max($user->id, $targetId);

        $friendship = Friendship::where(function ($query) use ($user, $targetId) {
            $query->where('requester_id', $user->id)->where('addressee_id', $targetId);
        })->orWhere(function ($query) use ($user, $targetId) {
            $query->where('requester_id', $targetId)->where('addressee_id', $user->id);
        })->first();

        if (!$friendship) {
            $friendship = Friendship::create([
                'requester_id' => $user->id,
                'addressee_id' => $targetId,
                'status' => 'pending',
            ]);
        }

        $other = User::findOrFail($targetId);

        return response()->json([
            'friendship' => $friendship,
            'friend' => $this->formatFriend($other, $friendship->status === 'accepted' ? 'accepted' : 'pending_sent'),
            'key' => $firstId . ':' . $secondId,
        ], 201);
    }

    public function accept(Request $request, int $id) {
        $user = $request->user();
        $friendship = Friendship::where('addressee_id', $user->id)
            ->where('requester_id', $id)
            ->firstOrFail();

        $friendship->update(['status' => 'accepted']);

        return response()->json([
            'friendship' => $friendship,
            'friend' => $this->formatFriend($friendship->requester, 'accepted'),
        ]);
    }

    public function destroy(Request $request, int $id) {
        $user = $request->user();

        Friendship::where(function ($query) use ($user, $id) {
            $query->where('requester_id', $user->id)->where('addressee_id', $id);
        })->orWhere(function ($query) use ($user, $id) {
            $query->where('requester_id', $id)->where('addressee_id', $user->id);
        })->delete();

        return response()->json(['success' => true]);
    }

    private function formatFriend(User $user, string $status): array {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'religion' => $user->religion ?? 'Mixte',
            'profession' => $user->profession ?? 'Fidele de la Communaute',
            'status' => $status,
            'isOnline' => true,
        ];
    }
}
