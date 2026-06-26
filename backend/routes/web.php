<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriteVerseController;
use App\Http\Controllers\UserNoteController;
use App\Http\Controllers\QuizScoreController;
use App\Http\Controllers\InspirationController;
use App\Http\Controllers\ReadingPlanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes d'API Publiques
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Routes d'API Protégées par Sanctum (Jeton Requis)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Profil utilisateur
    Route::get('/user', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Favoris / Versets Enregistrés
    Route::get('/favorite-verses', [FavoriteVerseController::class, 'index']);
    Route::post('/favorite-verses', [FavoriteVerseController::class, 'store']);
    Route::delete('/favorite-verses/{id}', [FavoriteVerseController::class, 'destroy']);

    // Notes de Réflexion / Journaling
    Route::get('/user-notes', [UserNoteController::class, 'index']);
    Route::post('/user-notes', [UserNoteController::class, 'store']);
    Route::delete('/user-notes/{id}', [UserNoteController::class, 'destroy']);

    // Quiz Quotidien
    Route::post('/quiz-scores', [QuizScoreController::class, 'store']);

    // Inspirations Publiques (Aspect Réseau Social)
    Route::get('/inspirations', [InspirationController::class, 'index']);
    Route::post('/inspirations', [InspirationController::class, 'store']);
    Route::post('/inspirations/{id}/like', [InspirationController::class, 'like']);

    // Plans de lecture de la Bible et du Coran
    Route::get('/reading-plans', [ReadingPlanController::class, 'index']);
    Route::post('/reading-progress', [ReadingPlanController::class, 'updateProgress']);
});
