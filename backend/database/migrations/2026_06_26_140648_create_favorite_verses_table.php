<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('favorite_verses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('source'); // 'Bible' ou 'Coran'
            $table->string('book');
            $table->integer('chapter');
            $table->integer('verse');
            $table->text('text');
            $table->string('reference');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('favorite_verses');
    }
};