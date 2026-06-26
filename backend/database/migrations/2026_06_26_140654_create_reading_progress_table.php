<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('reading_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('reading_plan_id')->constrained()->onDelete('cascade');
            $table->integer('current_day')->default(0);
            $table->integer('percentage')->default(0);
            $table->boolean('completed')->default(false);
            $table->timestamps();
            
            // Garantit qu'un utilisateur n'a qu'un suivi par plan
            $table->unique(['user_id', 'reading_plan_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('reading_progress');
    }
};