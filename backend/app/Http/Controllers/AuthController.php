<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller {
    public function register(Request $request) {
        $fields = $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users',
            'email' => 'required|string|unique:users|email',
            'password' => 'required|string',
            'religion' => 'required|string|in:Chrétienne,Musulmane,Mixte'
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'username' => $fields['username'],
            'email' => $fields['email'],
            'password' => bcrypt($fields['password']),
            'religion' => $fields['religion'],
            'avatar' => $fields['religion'] === 'Chrétienne' 
                ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' 
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200'
        ]);

        $token = $user->createToken('spirittalktoken')->plainTextToken;

        return response(['user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request) {
        $fields = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $fields['email'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response(['message' => 'Identifiants incorrects'], 401);
        }

        $token = $user->createToken('spirittalktoken')->plainTextToken;

        return response(['user' => $user, 'token' => $token], 200);
    }

    public function updateProfile(Request $request) {
        $user = $request->user();
        $fields = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|string|email',
            'religion' => 'sometimes|string|in:Chrétienne,Musulmane,Mixte',
            'avatar' => 'sometimes|string'
        ]);

        $user->update($fields);
        return response(['user' => $user, 'message' => 'Profil mis à jour !'], 200);
    }


    public function users(Request $request) {
        $currentUser = $request->user();
        $search = trim((string) $request->query('search', ''));

        $users = User::query()
            ->whereKeyNot($currentUser->id)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('name', 'like', '%' . $search . '%')
                        ->orWhere('username', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                });
            })
            ->orderByRaw('CASE WHEN name LIKE ? THEN 0 WHEN username LIKE ? THEN 1 ELSE 2 END', ['%' . $search . '%', '%' . $search . '%'])
            ->orderBy('name')
            ->limit(30)
            ->get(['id', 'name', 'username', 'email', 'religion', 'avatar', 'level', 'xp_points', 'profession', 'created_at']);

        return response()->json(['users' => $users], 200);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function profile(Request $request) {
        return response()->json($request->user());
    }
}
