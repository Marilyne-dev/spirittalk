<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chorale extends Model
{
    protected $fillable = [
        'user_id', 'nom', 'slug', 'courant', 'type',
        'langue', 'categorie', 'logo_url', 'description',
        'ville', 'pays', 'membres_count', 'est_verifie'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function chansons() {
        return $this->hasMany(Chanson::class);
    }
}