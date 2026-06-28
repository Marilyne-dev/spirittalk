<?php

use Illuminate\Support\Facades\Route;

/*
 * Route nommée 'login' requise par Laravel quand auth:sanctum rejette une requête.
 * Retourne du JSON (pas une redirection HTML) pour les clients API.
 */
Route::get('/login', function () {
    return response()->json(['message' => 'Non authentifié. Veuillez vous connecter.'], 401);
})->name('login');