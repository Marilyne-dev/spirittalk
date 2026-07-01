<?php
// Colle ce contenu dans le fichier database/migrations/xxxx_create_chorales_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('chorales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // président/créateur
            $table->string('nom');
            $table->string('slug')->unique();
            $table->enum('courant', ['catholique', 'evangelique']);
            $table->enum('type', ['chorale', 'groupe_priere', 'mouvement']);
            $table->enum('langue', ['langue', 'francais', 'mixte'])->default('mixte');
            $table->enum('categorie', ['adulte', 'jeunesse', 'enfant', 'mixte'])->default('mixte');
            $table->string('logo_url'); // OBLIGATOIRE — sans logo pas de création
            $table->text('description')->nullable();
            $table->string('ville')->nullable();
            $table->string('pays')->default('Bénin');
            $table->integer('membres_count')->default(0);
            $table->boolean('est_verifie')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('chorales');
    }
};