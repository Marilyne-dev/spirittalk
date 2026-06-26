# 🏰 Guide de Configuration du Backend Laravel (SpiritTalk)

Ce guide complet vous présente toutes les commandes, les fichiers de migration, les modèles, les contrôleurs et les routes nécessaires pour faire fonctionner votre backend Laravel sur **AlwaysData** en parfaite synergie avec le frontend React déployé sur **Vercel**.

---

## 🛠️ Étape 1 : Initialisation & Dépendances

Exécutez ces commandes dans le terminal de votre projet Laravel (via SSH ou votre interface AlwaysData) :

```bash
# 1. Installer Sanctum pour la gestion de jetons API sécurisés
composer require laravel/sanctum

# 2. Publier la configuration de Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

---

## 💾 Étape 2 : Fichiers de Migration (`database/migrations/`)

Remplacez le contenu de vos fichiers de migration existants ou créez-les avec les commandes `php artisan make:migration ...` puis copiez les codes suivants.

### 1. Table `users` (`xxxx_xx_xx_create_users_table.php`)
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->string('level')->default('Explorateur');
            $table->integer('xp_points')->default(0);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('users');
    }
};
```

### 2. Table `favorite_verses`
```bash
php artisan make:migration create_favorite_verses_table --create=favorite_verses
```
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('favorite_verses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('source'); // 'Bible' ou 'Coran'
            $table->string('book');
            $table->integer('chapter');
            $table->integer('verse');
            $table->text('text');
            $table->string('reference');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('favorite_verses');
    }
};
```

### 3. Table `user_notes`
```bash
php artisan make:migration create_user_notes_table --create=user_notes
```
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->string('category')->default('Méditation'); // 'Paix', 'Sagesse', etc.
            $table->string('source')->nullable(); // 'Bible' ou 'Coran' si lié à un verset
            $table->string('reference')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('user_notes');
    }
};
```

### 4. Table `quiz_scores`
```bash
php artisan make:migration create_quiz_scores_table --create=quiz_scores
```
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('quiz_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('score');
            $table->integer('total_questions');
            $table->string('theme')->nullable();
            $table->string('source')->nullable(); // 'Bible' ou 'Coran'
            $table->date('played_at');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('quiz_scores');
    }
};
```

### 5. Table `reading_plans`
```bash
php artisan make:migration create_reading_plans_table --create=reading_plans
```
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('reading_plans', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('theme'); // 'Paix', 'Sagesse', etc.
            $table->integer('duration_days'); // Nombre d'étapes/chapitres
            $table->string('cover_image')->nullable();
            $table->string('source'); // 'Bible', 'Coran' ou 'Mixte'
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('reading_plans');
    }
};
```

### 6. Table `reading_progress`
```bash
php artisan make:migration create_reading_progress_table --create=reading_progress
```
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('reading_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('reading_plan_id')->constrained()->onDelete('cascade');
            $table->integer('current_day')->default(0);
            $table->integer('percentage')->default(0);
            $table->boolean('completed')->default(false);
            $table->timestamps();
            
            // Garantit qu'un utilisateur n'a qu'un suivi par plan
            $table->unique(['user_id', 'reading_plan_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('reading_progress');
    }
};
```

### 7. Table `inspirations`
```bash
php artisan make:migration create_inspirations_table --create=inspirations
```
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('inspirations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->string('verse_reference')->nullable();
            $table->text('verse_text')->nullable();
            $table->string('source')->nullable(); // 'Bible' ou 'Coran'
            $table->integer('likes')->default(0);
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('inspirations');
    }
};
```

---

## 📁 Étape 3 : Modèles Éloquents (`app/Models/`)

Créez les modèles correspondants avec les relations appropriées :

### 1. `app/Models/User.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password', 'avatar', 'level', 'xp_points'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function favoriteVerses() {
        return $this->hasMany(FavoriteVerse::class);
    }

    public function notes() {
        return $this->hasMany(UserNote::class);
    }

    public function quizScores() {
        return $this->hasMany(QuizScore::class);
    }

    public function readingProgress() {
        return $this->hasMany(ReadingProgress::class);
    }

    public function inspirations() {
        return $this->hasMany(Inspiration::class);
    }
}
```

### 2. `app/Models/FavoriteVerse.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FavoriteVerse extends Model {
    protected $fillable = ['user_id', 'source', 'book', 'chapter', 'verse', 'text', 'reference'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
```

### 3. `app/Models/UserNote.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNote extends Model {
    protected $fillable = ['user_id', 'title', 'content', 'category', 'source', 'reference'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
```

### 4. `app/Models/QuizScore.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizScore extends Model {
    protected $fillable = ['user_id', 'score', 'total_questions', 'theme', 'source', 'played_at'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
```

### 5. `app/Models/ReadingPlan.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadingPlan extends Model {
    protected $fillable = ['title', 'description', 'theme', 'duration_days', 'cover_image', 'source'];

    public function progresses() {
        return $this->hasMany(ReadingProgress::class);
    }
}
```

### 6. `app/Models/ReadingProgress.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadingProgress extends Model {
    protected $table = 'reading_progress';
    protected $fillable = ['user_id', 'reading_plan_id', 'current_day', 'percentage', 'completed'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function readingPlan() {
        return $this->belongsTo(ReadingPlan::class);
    }
}
```

### 7. `app/Models/Inspiration.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inspiration extends Model {
    protected $fillable = ['user_id', 'content', 'verse_reference', 'verse_text', 'source', 'likes', 'is_public'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
```

---

## 🎮 Étape 4 : Contrôleurs API (`app/Http/Controllers/`)

Générez les contrôleurs nécessaires et renseignez-les avec ces implémentations robustes.

### 1. `app/Http/Controllers/AuthController.php`
```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller {
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200', // Avatar par défaut
            'level' => 'Explorateur',
            'xp_points' => 0
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ], 201);
    }

    public function login(Request $request) {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function profile(Request $request) {
        return response()->json($request->user());
    }
}
```

### 2. `app/Http/Controllers/FavoriteVerseController.php`
```php
<?php

namespace App\Http\Controllers;

use App\Models\FavoriteVerse;
use Illuminate\Http\Request;

class FavoriteVerseController extends Controller {
    public function index(Request $request) {
        return response()->json($request->user()->favoriteVerses()->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request) {
        $request->validate([
            'source' => 'required|string',
            'book' => 'required|string',
            'chapter' => 'required|integer',
            'verse' => 'required|integer',
            'text' => 'required|string',
            'reference' => 'required|string',
        ]);

        $favorite = $request->user()->favoriteVerses()->create($request->all());
        
        // Ajouter des points XP pour la dévotion
        $user = $request->user();
        $user->increment('xp_points', 15);
        $this->updateUserLevel($user);

        return response()->json($favorite, 201);
    }

    public function destroy(Request $request, $id) {
        $favorite = $request->user()->favoriteVerses()->findOrFail($id);
        $favorite->delete();
        return response()->json(['message' => 'Verset retiré des favoris']);
    }

    private function updateUserLevel($user) {
        if ($user->xp_points >= 2000) {
            $user->level = 'Sage Illuminé';
        } elseif ($user->xp_points >= 1000) {
            $user->level = 'Pèlerin Averti';
        } elseif ($user->xp_points >= 400) {
            $user->level = 'Chercheur de Vérité';
        }
        $user->save();
    }
}
```

### 3. `app/Http/Controllers/UserNoteController.php`
```php
<?php

namespace App\Http\Controllers;

use App\Models\UserNote;
use Illuminate\Http\Request;

class UserNoteController extends Controller {
    public function index(Request $request) {
        return response()->json($request->user()->notes()->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request) {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string',
            'source' => 'nullable|string',
            'reference' => 'nullable|string',
        ]);

        $note = $request->user()->notes()->create($request->all());

        // Récompense XP
        $user = $request->user();
        $user->increment('xp_points', 25); // Écrire des notes stimule la sagesse !
        
        return response()->json($note, 201);
    }

    public function destroy(Request $request, $id) {
        $note = $request->user()->notes()->findOrFail($id);
        $note->delete();
        return response()->json(['message' => 'Note personnelle supprimée']);
    }
}
```

### 4. `app/Http/Controllers/QuizScoreController.php`
```php
<?php

namespace App\Http\Controllers;

use App\Models\QuizScore;
use Illuminate\Http\Request;

class QuizScoreController extends Controller {
    public function store(Request $request) {
        $request->validate([
            'score' => 'required|integer',
            'total_questions' => 'required|integer',
            'theme' => 'nullable|string',
            'source' => 'nullable|string',
            'played_at' => 'required|date',
        ]);

        $score = $request->user()->quizScores()->create($request->all());

        // Calcul de points XP gagnés dans le quiz
        $xpGained = $request->score * 20; // 20 XP par bonne réponse
        $user = $request->user();
        $user->increment('xp_points', $xpGained);

        return response()->json([
            'message' => 'Score enregistré avec succès',
            'score' => $score,
            'xp_gained' => $xpGained,
            'total_xp' => $user->xp_points
        ]);
    }
}
```

### 5. `app/Http/Controllers/InspirationController.php`
```php
<?php

namespace App\Http\Controllers;

use App\Models\Inspiration;
use Illuminate\Http\Request;

class InspirationController extends Controller {
    public function index() {
        // Charge toutes les inspirations publiques avec les détails de l'utilisateur qui l'a créée
        $inspirations = Inspiration::with('user')
            ->where('is_public', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($inspirations);
    }

    public function store(Request $request) {
        $request->validate([
            'content' => 'required|string',
            'verse_reference' => 'nullable|string',
            'verse_text' => 'nullable|string',
            'source' => 'nullable|string',
            'is_public' => 'boolean'
        ]);

        $inspiration = $request->user()->inspirations()->create($request->all());

        // Bonus d'XP pour le partage d'une inspiration
        $user = $request->user();
        $user->increment('xp_points', 30);

        return response()->json(Inspiration::with('user')->find($inspiration->id), 201);
    }

    public function like($id) {
        $inspiration = Inspiration::findOrFail($id);
        $inspiration->increment('likes');
        
        return response()->json([
            'id' => $inspiration->id,
            'likes' => $inspiration->likes
        ]);
    }
}
```

### 6. `app/Http/Controllers/ReadingPlanController.php`
```php
<?php

namespace App\Http\Controllers;

use App\Models\ReadingPlan;
use App\Models\ReadingProgress;
use Illuminate\Http\Request;

class ReadingPlanController extends Controller {
    public function index(Request $request) {
        $plans = ReadingPlan::all();
        $user = $request->user();

        // Ajoute l'état de progression de l'utilisateur pour chaque plan
        $plansWithProgress = $plans->map(function ($plan) use ($user) {
            $progress = ReadingProgress::where('user_id', $user->id)
                ->where('reading_plan_id', $plan->id)
                ->first();

            return [
                'id' => $plan->id,
                'title' => $plan->title,
                'description' => $plan->description,
                'theme' => $plan->theme,
                'duration_days' => $plan->duration_days,
                'cover_image' => $plan->cover_image,
                'source' => $plan->source,
                'progress' => $progress ? [
                    'current_day' => $progress->current_day,
                    'percentage' => $progress->percentage,
                    'completed' => (bool)$progress->completed
                ] : null
            ];
        });

        return response()->json($plansWithProgress);
    }

    public function updateProgress(Request $request) {
        $request->validate([
            'reading_plan_id' => 'required|exists:reading_plans,id',
            'current_day' => 'required|integer',
            'percentage' => 'required|integer',
            'completed' => 'required|boolean'
        ]);

        $progress = ReadingProgress::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'reading_plan_id' => $request->reading_plan_id
            ],
            [
                'current_day' => $request->current_day,
                'percentage' => $request->percentage,
                'completed' => $request->completed
            ]
        );

        // Bonus XP si complété !
        if ($request->completed) {
            $request->user()->increment('xp_points', 150);
        }

        return response()->json([
            'success' => true,
            'progress' => $progress
        ]);
    }
}
```

---

## 🛣️ Étape 5 : Routes d'API (`routes/api.php`)

Ajoutez ces routes dans votre fichier `routes/api.php` pour relier tous vos contrôleurs à l'application React :

```php
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
```

---

## 🌻 Étape 6 : Seeder de Plans de Lecture (`database/seeders/`)

Pour remplir votre base de données avec de superbes plans de lecture par défaut, créez un seeder :

```bash
php artisan make:seeder ReadingPlansSeeder
```

Insérez ce code dans `database/seeders/ReadingPlansSeeder.php` :

```php
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
```

Puis exécutez le seeder :
```bash
php artisan db:seed --class=ReadingPlansSeeder
```

---

## 🔒 Étape 7 : Configuration CORS (`config/cors.php`)

Pour que votre frontend Vercel et AlwaysData puissent communiquer sans erreur CORS, ouvrez `config/cors.php` et ajustez les paramètres comme suit :

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:5173', 'https://spirittalk.vercel.app'], // Ajoutez votre URL Vercel finale !
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

---

### 🎉 C'est tout !
Une fois les migrations lancées (`php artisan migrate`) et les seeders activés, votre backend Laravel complet sera 100% prêt à recevoir les connexions de l'application React SpiritTalk !

**Que souhaitez-vous ajuster ou implémenter ensuite ?**
