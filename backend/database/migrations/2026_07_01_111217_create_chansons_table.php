<?php
// Colle ce contenu dans database/migrations/xxxx_create_chansons_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('chansons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chorale_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // qui a ajouté
            $table->string('titre');
            $table->string('psaume')->nullable(); // ex: "Psaume 21"
            $table->enum('type_contenu', ['audio', 'texte', 'image', 'priere'])->default('audio');
            $table->string('audio_url')->nullable();   // chemin fichier audio (tout format)
            $table->string('image_url')->nullable();   // partition en image
            $table->longText('texte')->nullable();     // paroles écrites
            $table->string('format_fichier')->nullable(); // mp3, wav, m4a, etc.
            $table->bigInteger('taille_fichier')->nullable(); // en octets
            $table->string('duree')->nullable(); // ex: "3:42"
            $table->integer('telecharge_count')->default(0);
            $table->integer('ecoute_count')->default(0);
            $table->boolean('est_gratuit')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('chansons');
    }
};