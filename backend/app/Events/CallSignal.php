<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallSignal implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly array $signal,
        public readonly int $senderId,
        public readonly int $recipientId,
        public readonly string $type
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('spirittalk-calls'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'call-signal';
    }

    public function broadcastWith(): array
    {
        return [
            'senderId' => $this->senderId,
            'recipientId' => $this->recipientId,
            'type' => $this->type,
            'signal' => $this->signal,
        ];
    }
}
