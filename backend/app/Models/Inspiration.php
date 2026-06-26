<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inspiration extends Model {
    protected $fillable = ['user_id', 'content', 'verse_reference', 'verse_text', 'source', 'likes', 'is_public', 'images', 'video_url'];

    protected $casts = [
        'images' => 'array',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function comments() {
        return $this->hasMany(PostComment::class);
    }
}
