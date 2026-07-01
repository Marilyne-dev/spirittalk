<?php

namespace App\Events;

use App\Models\Chorale;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Diffusé chaque fois qu'une nouvelle chorale/groupe est créé.
 * Écouté côté front par pusherService.tsx sur le canal 'spirittalk-choir',
 * event 'new-chorale'.
 */
class NouvelleChorale implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Chorale $chorale;

    public function __construct(Chorale $chorale)
    {
        $this->chorale = $chorale;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('spirittalk-choir');
    }

    public function broadcastAs(): string
    {
        return 'new-chorale';
    }

    /**
     * Le payload est transformé ici pour correspondre exactement à
     * l'interface Chorale attendue par ChoirView.tsx côté front.
     */
    public function broadcastWith(): array
    {
        return [
            'id'            => $this->chorale->id,
            'name'          => $this->chorale->nom,
            'type'          => $this->mapType($this->chorale->type, $this->chorale->categorie),
            'denomination'  => $this->chorale->courant,
            'church'        => $this->chorale->ville ?? '',
            'city'          => $this->chorale->ville ?? '',
            'logo_url'      => $this->chorale->logo_url,
            'description'   => $this->chorale->description,
            'admin_user_id' => (string) $this->chorale->user_id,
            'songs_count'   => 0,
        ];
    }

    /**
     * Convertit les champs backend (type/categorie) vers le type
     * attendu côté front : 'en_langue' | 'jeunesse' | 'groupe_priere'.
     */
    private function mapType(?string $type, ?string $categorie): string
    {
        if ($type === 'groupe_priere') {
            return 'groupe_priere';
        }
        if (in_array($categorie, ['jeunesse', 'enfant'], true)) {
            return 'jeunesse';
        }
        return 'en_langue';
    }
}