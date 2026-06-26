<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriteVerseController;
use App\Http\Controllers\UserNoteController;
use App\Http\Controllers\InspirationController;
use App\Http\Controllers\ReadingPlanController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par Sanctum (Authentification requise)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'profile']);
    Route::post('/user/update', [AuthController::class, 'updateProfile']);
    
    // Notes de Réflexion (Journal)
    Route::apiResource('user-notes', UserNoteController::class);
    
    // Versets Favoris (Bookmarks)
    Route::apiResource('favorite-verses', FavoriteVerseController::class);
    
    // Fil Communautaire (Inspirations)
    Route::get('/inspirations', [InspirationController::class, 'index']);
    Route::post('/inspirations', [InspirationController::class, 'store']);
    Route::post('/inspirations/{id}/like', [InspirationController::class, 'like']);
    
    // Plans de Lecture & Progression
    Route::get('/reading-plans', [ReadingPlanController::class, 'index']);
    Route::post('/reading-progress', [ReadingPlanController::class, 'updateProgress']);
});