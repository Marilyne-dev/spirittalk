<?php

namespace App\Http\Controllers;

use App\Models\DirectMessage;
use Illuminate\Http\Request;

class DirectMessageController extends Controller {
    public function index(Request $request) {
        $user = $request->user();

        $messages = DirectMessage::where('sender_id', $user->id)
            ->orWhere('recipient_id', $user->id)
            ->orderBy('created_at')
            ->limit(500)
            ->get();

        return response()->json($messages->map(fn (DirectMessage $message) => $this->formatMessage($message, $user->id))->values());
    }

    public function store(Request $request) {
        $fields = $request->validate([
            'recipient_id' => 'required|integer|exists:users,id',
            'text' => 'nullable|string',
            'images' => 'nullable|array',
            'audio_url' => 'nullable|string',
            'audio_duration' => 'nullable|string',
            'call_type' => 'nullable|string|in:audio,video',
        ]);

        $message = DirectMessage::create([
            'sender_id' => $request->user()->id,
            'recipient_id' => $fields['recipient_id'],
            'text' => $fields['text'] ?? null,
            'images' => $fields['images'] ?? null,
            'audio_url' => $fields['audio_url'] ?? null,
            'audio_duration' => $fields['audio_duration'] ?? null,
            'call_type' => $fields['call_type'] ?? null,
        ]);

        return response()->json($this->formatMessage($message, $request->user()->id), 201);
    }

    private function formatMessage(DirectMessage $message, int $currentUserId): array {
        return [
            'id' => (string) $message->id,
            'senderId' => $message->sender_id === $currentUserId ? 'me' : (string) $message->sender_id,
            'recipientId' => $message->recipient_id === $currentUserId ? 'me' : (string) $message->recipient_id,
            'text' => $message->text,
            'images' => $message->images,
            'audioUrl' => $message->audio_url,
            'audioDuration' => $message->audio_duration,
            'callType' => $message->call_type,
            'timestamp' => $message->created_at?->format('H:i') ?? now()->format('H:i'),
        ];
    }
}
