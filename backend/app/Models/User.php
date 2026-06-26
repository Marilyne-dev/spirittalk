<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password', 'avatar', 'level', 'xp_points'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function favoriteVerses() {
        return $this->hasMany(FavoriteVerse::class);
    }

    public function notes() {
        return $this->hasMany(UserNote::class);
    }

    public function quizScores() {
        return $this->hasMany(QuizScore::class);
    }

    public function readingProgress() {
        return $this->hasMany(ReadingProgress::class);
    }

    public function inspirations() {
        return $this->hasMany(Inspiration::class);
    }
}