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
        return [
            'message' => $this->message,
            'senderId' => (string) $this->senderId,
            'recipientId' => (string) $this->recipientId,
        ];
    }
}
