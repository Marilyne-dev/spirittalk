<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->string('category')->default('Méditation'); // 'Paix', 'Sagesse', etc.
            $table->string('source')->nullable(); // 'Bible' ou 'Coran' si lié à un verset
            $table->string('reference')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('user_notes');
    }
};