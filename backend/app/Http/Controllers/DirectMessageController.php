<?php

namespace App\Http\Controllers;

use App\Events\CallSignal;
use App\Events\NewDirectMessage;
use App\Events\TypingStatus;
use App\Models\DirectMessage;
use App\Models\User;
use Illuminate\Http\Request;

class DirectMessageController extends Controller {

    public function index(Request $request) {
        $user = $request->user();
        $messages = DirectMessage::where('sender_id', $user->id)
            ->orWhere('recipient_id', $user->id)
            ->orderBy('created_at')
            ->limit(500)
            ->get();

        // ✅ FIX : on passe null pour ne PAS remplacer les IDs par 'me'
        // Le frontend normalise lui-même avec son propre myId
        return response()->json(
            $messages->map(fn (DirectMessage $m) => $this->formatMessage($m))->values()
        );
    }

    public function store(Request $request) {
        $fields = $request->validate([
            'recipient_id'   => 'required|integer|exists:users,id',
            'text'           => 'nullable|string',
            'images'         => 'nullable|array',
            'audio_url'      => 'nullable|string',
            'audio_duration' => 'nullable|string',
            'call_type'      => 'nullable|string|in:audio,video',
        ]);

        $sender = $request->user();

        $message = DirectMessage::create([
            'sender_id'      => $sender->id,
            'recipient_id'   => $fields['recipient_id'],
            'text'           => $fields['text'] ?? null,
            'images'         => $fields['images'] ?? null,
            'audio_url'      => $fields['audio_url'] ?? null,
            'audio_duration' => $fields['audio_duration'] ?? null,
            'call_type'      => $fields['call_type'] ?? null,
        ]);

        // ✅ FIX : formatMessage sans currentUserId = vrais IDs numériques
        $formatted = $this->formatMessage($message);

        broadcast(new NewDirectMessage($formatted, (int) $sender->id, (int) $fields['recipient_id']));

        return response()->json($formatted, 201);
    }

    public function markRead(Request $request, int $senderId) {
        $user = $request->user();
        DirectMessage::where('sender_id', $senderId)
            ->where('recipient_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
        return response()->json(['success' => true]);
    }

    public function unreadCounts(Request $request) {
        $user = $request->user();
        $counts = DirectMessage::where('recipient_id', $user->id)
            ->whereNull('read_at')
            ->selectRaw('sender_id, COUNT(*) as count')
            ->groupBy('sender_id')
            ->get()
            ->mapWithKeys(fn ($row) => [(string) $row->sender_id => $row->count]);
        return response()->json($counts);
    }

    public function typing(Request $request) {
        $fields = $request->validate([
            'recipient_id' => 'required|integer|exists:users,id',
            'is_typing'    => 'required|boolean',
            'live_text'    => 'nullable|string|max:500',
        ]);

        $sender = $request->user();

        broadcast(new TypingStatus(
            $sender->id,
            $sender->name,
            (int) $fields['recipient_id'],
            (bool) $fields['is_typing'],
            $fields['live_text'] ?? null
        ));

        return response()->json(['success' => true]);
    }

    public function callSignal(Request $request) {
        $fields = $request->validate([
            'recipient_id' => 'required|integer|exists:users,id',
            'signal'       => 'required|array',
            'type'         => 'required|string|in:offer,answer,ice-candidate,hangup,ringing',
        ]);

        $sender = $request->user();

        broadcast(new CallSignal(
            $fields['signal'],
            (int) $sender->id,
            (int) $fields['recipient_id'],
            $fields['type']
        ));

        return response()->json(['success' => true]);
    }

    // ✅ FIX : plus de currentUserId — toujours de vrais IDs numériques
    private function formatMessage(DirectMessage $message): array {
        return [
            'id'            => (string) $message->id,
            'senderId'      => (string) $message->sender_id,
            'recipientId'   => (string) $message->recipient_id,
            'text'          => $message->text,
            'images'        => $message->images,
            'audioUrl'      => $message->audio_url,
            'audioDuration' => $message->audio_duration,
            'callType'      => $message->call_type,
            'readAt'        => $message->read_at,
            'timestamp'     => $message->created_at?->format('H:i') ?? now()->format('H:i'),
        ];
    }
}