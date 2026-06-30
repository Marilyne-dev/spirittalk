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

// ✅ FIX : routes non protégées — read/unread peuvent se faire sans auth
Route::post('/direct-messages/mark-read/{senderId}', [DirectMessageController::class, 'markRead']);
Route::get('/direct-messages/unread-counts', [DirectMessageController::class, 'unreadCounts']);

// Proxy Bible API
Route::get('/bible', function (\Illuminate\Http\Request $request) {
    $book = $request->query('book');
    $chapter = $request->query('chapter');
    if (!$book || !$chapter) {
        return response()->json(['error' => 'book et chapter requis'], 400);
    }
    $url = 'https://bible-api.com/' . urlencode($book) . '+' . urlencode($chapter) . '?translation=lsg';
    $response = @file_get_contents($url);
    if ($response === false) {
        return response()->json(['error' => 'Bible API inaccessible'], 502);
    }
    return response($response, 200)->header('Content-Type', 'application/json');
});

// Proxy Gemini AI
Route::post('/gemini/chat', function (\Illuminate\Http\Request $request) {
    $userMessage = $request->input('userMessage');
    $messages = $request->input('messages', []);
    if (!$userMessage) {
        return response()->json(['error' => 'userMessage requis'], 400);
    }
    $apiKey = env('OPENROUTER_API_KEY');
    if (!$apiKey) {
        return response()->json(['text' => '[Sagesse Divine] La paix soit avec vous.'], 200);
    }
    $formattedMessages = [['role' => 'system', 'content' => "Tu es 'Sagesse Divine', un guide spirituel bienveillant sur SpiritTalk. Réponds en français avec amour et sérénité. Cite toujours un verset de la Bible ou du Coran avec sa référence précise. Reste œcuménique."]];
    foreach ($messages as $m) {
        $formattedMessages[] = ['role' => ($m['role'] ?? 'user') === 'user' ? 'user' : 'assistant', 'content' => $m['text'] ?? ''];
    }
    $formattedMessages[] = ['role' => 'user', 'content' => $userMessage];
    $body = json_encode(['model' => 'mistralai/mistral-7b-instruct:free', 'messages' => $formattedMessages]);
    $opts = ['http' => ['method' => 'POST', 'header' => "Content-Type: application/json\r\nAuthorization: Bearer " . $apiKey . "\r\n", 'content' => $body]];
    $url = 'https://openrouter.ai/api/v1/chat/completions';
    $result = @file_get_contents($url, false, stream_context_create($opts));
    if ($result === false) {
        return response()->json(['text' => 'Le service de sagesse est temporairement indisponible.'], 200);
    }
    $data = json_decode($result, true);
    $text = $data['choices'][0]['message']['content'] ?? 'Que la paix guide vos pas.';
    $refRegex = '/(Psaumes?|Matthieu|Coran|Sourate|Jean|Corinthiens|Philippiens|Proverbes|Galates|Al-[A-Za-z]+)\s+\d+:\d+/i';
    preg_match($refRegex, $text, $match);
    $scriptureQuote = null;
    if (!empty($match[0])) {
        $ref = $match[0];
        $isCoran = stripos($ref, 'coran') !== false || stripos($ref, 'sourate') !== false || stripos($ref, 'al-') !== false;
        $scriptureQuote = ['text' => 'Réflexion guidée par cette Écriture sainte.', 'reference' => $ref, 'source' => $isCoran ? 'Coran' : 'Bible'];
    }
    return response()->json(['text' => $text, 'scriptureQuote' => $scriptureQuote]);
});

Route::get('/bible', function (\Illuminate\Http\Request $request) {
    $book = $request->query('book');
    $chapter = $request->query('chapter');
    if (!$book || !$chapter) {
        return response()->json(['error' => 'book et chapter requis'], 400);
    }
    $url = 'https://labs.bible.org/api/?passage=' . urlencode($book) . '+' . urlencode($chapter) . '&type=json&formatting=plain';
    $result = @file_get_contents($url);
    if ($result === false) {
        return response()->json(['error' => 'Bible API inaccessible'], 502);
    }
    $verses = json_decode($result, true);
    $text = '';
    foreach ($verses as $v) {
        $text .= $v['verse'] . '. ' . $v['text'] . ' ';
    }
    return response()->json([
        'reference' => ucfirst($book) . ' ' . $chapter,
        'text' => trim($text),
        'translation_name' => 'NET Bible (English)',
        'verses' => $verses
    ]);
});

Route::get('/quran', function (\Illuminate\Http\Request $request) {
    $surah = $request->query('surah');
    $ayah = $request->query('ayah');
    if (!$surah) {
        return response()->json(['error' => 'surah requis'], 400);
    }
    $url = $ayah
        ? 'https://api.alquran.cloud/v1/ayah/' . $surah . ':' . $ayah . '/fr.hamidullah'
        : 'https://api.alquran.cloud/v1/surah/' . $surah . '/fr.hamidullah';
    $result = @file_get_contents($url);
    if ($result === false) {
        return response()->json(['error' => 'Coran API inaccessible'], 502);
    }
    return response($result, 200)->header('Content-Type', 'application/json');
});
Route::post('/upload-audio', [App\Http\Controllers\UploadController::class, 'audio']);


