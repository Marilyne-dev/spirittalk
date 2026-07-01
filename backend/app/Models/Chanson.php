<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chanson extends Model
{
    protected $fillable = [
        'chorale_id', 'user_id', 'titre', 'psaume',
        'type_contenu', 'audio_url', 'image_url', 'texte',
        'format_fichier', 'taille_fichier', 'duree',
        'telecharge_count', 'ecoute_count', 'est_gratuit'
    ];

    public function chorale() {
        return $this->belongsTo(Chorale::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}