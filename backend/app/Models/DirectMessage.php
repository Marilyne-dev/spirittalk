<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DirectMessage extends Model {
    protected $fillable = [
        'sender_id',
        'recipient_id',
        'text',
        'images',
        'audio_url',
        'audio_duration',
        'call_type',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    public function sender() {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient() {
        return $this->belongsTo(User::class, 'recipient_id');
    }
}
