<?php
namespace App\Events;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TypingStatus implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $senderId,
        public readonly string $senderName,
        public readonly int $recipientId,
        public readonly bool $isTyping,
        public readonly ?string $liveText = null  // texte en cours de frappe
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('spirittalk-chat'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'typing-status';
    }

    public function broadcastWith(): array
    {
        return [
            'senderId'    => $this->senderId,
            'senderName'  => $this->senderName,
            'recipientId' => (string) $this->recipientId,
            'isTyping'    => $this->isTyping,
            'liveText'    => $this->liveText,  // null si pas de texte
        ];
    }
}