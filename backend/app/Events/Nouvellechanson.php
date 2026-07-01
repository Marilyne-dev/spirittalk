<?php

namespace App\Events;

use App\Models\Chanson;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Diffusé chaque fois qu'une nouvelle chanson/prière est ajoutée à une chorale.
 * Écouté côté front par pusherService.tsx sur le canal 'spirittalk-choir',
 * event 'new-chanson'.
 */
class NouvelleChanson implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Chanson $chanson;

    public function __construct(Chanson $chanson)
    {
        $this->chanson = $chanson;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('spirittalk-choir');
    }

    public function broadcastAs(): string
    {
        return 'new-chanson';
    }

    /**
     * Le payload est transformé ici pour correspondre exactement à
     * l'interface Song attendue par ChoirView.tsx côté front.
     */
    public function broadcastWith(): array
    {
        return [
            'id'         => $this->chanson->id,
            'choir_id'   => $this->chanson->chorale_id,
            'name'       => $this->chanson->titre,
            'psalm_number' => $this->chanson->psaume,
            'audio_url'  => $this->chanson->audio_url,
            'lyrics_text' => $this->chanson->texte,
            'lyrics_image_url' => $this->chanson->image_url,
            'language'   => null,
            'uploaded_by' => (string) $this->chanson->user_id,
            'duration'   => $this->chanson->duree,
        ];
    }
}