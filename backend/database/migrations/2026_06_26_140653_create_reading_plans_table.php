<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('reading_plans', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('theme'); // 'Paix', 'Sagesse', etc.
            $table->integer('duration_days'); // Nombre d'étapes/chapitres
            $table->string('cover_image')->nullable();
            $table->string('source'); // 'Bible', 'Coran' ou 'Mixte'
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('reading_plans');
    }
};