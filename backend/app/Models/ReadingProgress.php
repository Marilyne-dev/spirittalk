<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadingProgress extends Model {
    protected $table = 'reading_progress';
    protected $fillable = ['user_id', 'reading_plan_id', 'current_day', 'percentage', 'completed'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function readingPlan() {
        return $this->belongsTo(ReadingPlan::class);
    }
}