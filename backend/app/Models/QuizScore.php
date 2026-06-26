<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizScore extends Model {
    protected $fillable = ['user_id', 'score', 'total_questions', 'theme', 'source', 'played_at'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}