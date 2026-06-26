<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('inspirations', function (Blueprint $table) {
            if (!Schema::hasColumn('inspirations', 'images')) {
                $table->json('images')->nullable()->after('content');
            }

            if (!Schema::hasColumn('inspirations', 'video_url')) {
                $table->string('video_url')->nullable()->after('images');
            }
        });

        Schema::create('post_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspiration_id')->constrained('inspirations')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->timestamps();
        });

        Schema::create('friendships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('addressee_id')->constrained('users')->onDelete('cascade');
            $table->string('status')->default('pending');
            $table->timestamps();
            $table->unique(['requester_id', 'addressee_id']);
        });

        Schema::create('direct_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('users')->onDelete('cascade');
            $table->text('text')->nullable();
            $table->json('images')->nullable();
            $table->longText('audio_url')->nullable();
            $table->string('audio_duration')->nullable();
            $table->string('call_type')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('direct_messages');
        Schema::dropIfExists('friendships');
        Schema::dropIfExists('post_comments');

        Schema::table('inspirations', function (Blueprint $table) {
            if (Schema::hasColumn('inspirations', 'video_url')) {
                $table->dropColumn('video_url');
            }

            if (Schema::hasColumn('inspirations', 'images')) {
                $table->dropColumn('images');
            }
        });
    }
};
