<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostComment extends Model {
    protected $fillable = ['inspiration_id', 'user_id', 'content'];

    public function inspiration() {
        return $this->belongsTo(Inspiration::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
