<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewDirectMessage implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly array $message,
        public readonly int $senderId,
        public readonly int $recipientId
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('spirittalk-chat'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new-message';
    }

    public function broadcastWith(): array
    {
        // ✅ FIX : tout à plat, pas de sous-objet "message"
        // pusherService lit data.message || data — on met tout à la racine
        return [
            'id'            => $this->message['id'] ?? null,
            'senderId'      => (string) $this->senderId,
            'recipientId'   => (string) $this->recipientId,
            'text'          => $this->message['text'] ?? null,
            'images'        => $this->message['images'] ?? null,
            'audioUrl'      => $this->message['audio_url'] ?? null,
            'audioDuration' => $this->message['audio_duration'] ?? null,
            'timestamp'     => $this->message['timestamp'] ?? now()->format('H:i'),
        ];
    }
}