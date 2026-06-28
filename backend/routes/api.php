<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriteVerseController;
use App\Http\Controllers\UserNoteController;
use App\Http\Controllers\InspirationController;
use App\Http\Controllers\ReadingPlanController;
use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\DirectMessageController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par Sanctum (Authentification requise)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'profile']);
    Route::post('/user/update', [AuthController::class, 'updateProfile']);
    Route::get('/users', [AuthController::class, 'users']);
    
    // Notes de Réflexion (Journal)
    Route::apiResource('user-notes', UserNoteController::class);
    
    // Versets Favoris (Bookmarks)
    Route::apiResource('favorite-verses', FavoriteVerseController::class);
    
    // Fil Communautaire (Inspirations)
    Route::get('/inspirations', [InspirationController::class, 'index']);
    Route::post('/inspirations', [InspirationController::class, 'store']);
    Route::post('/inspirations/{id}/like', [InspirationController::class, 'like']);
    Route::post('/inspirations/{id}/comments', [InspirationController::class, 'comment']);

    // Relations, invitations et messages privés
    Route::get('/friendships', [FriendshipController::class, 'index']);
    Route::post('/friendships', [FriendshipController::class, 'store']);
    Route::post('/friendships/{id}/accept', [FriendshipController::class, 'accept']);
    Route::delete('/friendships/{id}', [FriendshipController::class, 'destroy']);
    Route::get('/direct-messages', [DirectMessageController::class, 'index']);
    Route::post('/direct-messages', [DirectMessageController::class, 'store']);
    Route::post('/direct-messages/typing', [DirectMessageController::class, 'typing']);
    Route::post('/direct-messages/call-signal', [DirectMessageController::class, 'callSignal']);
    
    // Plans de Lecture & Progression
    Route::get('/reading-plans', [ReadingPlanController::class, 'index']);
    Route::post('/reading-progress', [ReadingPlanController::class, 'updateProgress']);
});

Route::get('/test-final', function() { return 'ok'; });