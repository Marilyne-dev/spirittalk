<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('inspirations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->string('verse_reference')->nullable();
            $table->text('verse_text')->nullable();
            $table->string('source')->nullable(); // 'Bible' ou 'Coran'
            $table->integer('likes')->default(0);
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('inspirations');
    }
};