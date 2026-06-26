<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'religion')) {
                $table->string('religion')->default('Mixte')->after('password');
            }

            if (!Schema::hasColumn('users', 'profession')) {
                $table->string('profession')->nullable()->after('xp_points');
            }
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'profession')) {
                $table->dropColumn('profession');
            }

            if (Schema::hasColumn('users', 'religion')) {
                $table->dropColumn('religion');
            }
        });
    }
};
