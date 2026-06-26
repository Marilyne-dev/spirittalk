<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadingPlan extends Model {
    protected $fillable = ['title', 'description', 'theme', 'duration_days', 'cover_image', 'source'];

    public function progresses() {
        return $this->hasMany(ReadingProgress::class);
    }
}