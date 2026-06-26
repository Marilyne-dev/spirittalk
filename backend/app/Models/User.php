<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password', 'religion', 'avatar', 'level', 'xp_points', 'profession'
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

    public function sentFriendRequests() {
        return $this->hasMany(Friendship::class, 'requester_id');
    }

    public function receivedFriendRequests() {
        return $this->hasMany(Friendship::class, 'addressee_id');
    }

    public function sentMessages() {
        return $this->hasMany(DirectMessage::class, 'sender_id');
    }

    public function receivedMessages() {
        return $this->hasMany(DirectMessage::class, 'recipient_id');
    }
}
