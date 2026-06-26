<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNote extends Model {
    protected $fillable = ['user_id', 'title', 'content', 'category', 'source', 'reference'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}