<?php
// Colle ce contenu dans database/migrations/xxxx_create_telechargements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('telechargements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('chanson_id')->constrained()->onDelete('cascade');
            $table->date('date_telechargement');
            $table->boolean('est_paye')->default(false);
            $table->string('reference_paiement')->nullable(); // référence FedaPay
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('telechargements');
    }
};