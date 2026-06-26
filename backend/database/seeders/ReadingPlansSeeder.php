<?php

namespace Database\Seeders;

use App\Models\ReadingPlan;
use Illuminate\Database\Seeder;

class ReadingPlansSeeder extends Seeder {
    public function run(): void {
        ReadingPlan::create([
            'title' => 'La Paix Intérieure',
            'description' => 'Un cheminement spirituel de 7 jours pour apaiser son cœur et trouver le repos spirituel en temps de tempêtes.',
            'theme' => 'Paix',
            'duration_days' => 7,
            'source' => 'Mixte',
        ]);

        ReadingPlan::create([
            'title' => 'Sagesse des Anciens',
            'description' => 'Découvrez les enseignements fondamentaux et paraboles clés pour guider vos choix quotidiens avec sagesse.',
            'theme' => 'Sagesse',
            'duration_days' => 10,
            'source' => 'Bible',
        ]);

        ReadingPlan::create([
            'title' => 'Le Chemin du Pardon',
            'description' => 'Une étude approfondie sur la miséricorde, la réconciliation et la libération spirituelle.',
            'theme' => 'Pardon',
            'duration_days' => 5,
            'source' => 'Coran',
        ]);
    }
}