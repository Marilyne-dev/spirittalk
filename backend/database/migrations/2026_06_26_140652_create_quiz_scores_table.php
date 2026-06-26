<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('quiz_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('score');
            $table->integer('total_questions');
            $table->string('theme')->nullable();
            $table->string('source')->nullable(); // 'Bible' ou 'Coran'
            $table->date('played_at');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('quiz_scores');
    }
};