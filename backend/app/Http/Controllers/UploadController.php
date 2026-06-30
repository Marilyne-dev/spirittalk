<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;

class UploadController extends Controller {

    public function store(Request $request) {
        $request->validate(['image' => 'required|string']);
        
        $base64 = $request->input('image');
        $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
        $data = base64_decode($base64);
        
        $filename = 'img_' . uniqid() . '.jpg';
        $path = public_path('uploads/' . $filename);
        
        if (!is_dir(public_path('uploads'))) {
            mkdir(public_path('uploads'), 0755, true);
        }
        
        file_put_contents($path, $data);
        
        return response()->json([
            'url' => config('app.url') . '/uploads/' . $filename
        ]);
    }

    public function audio(Request $request) {
        $request->validate(['audio' => 'required|string']);
        
        $base64 = $request->input('audio');
        $base64 = preg_replace('/^data:audio\/\w+;base64,/', '', $base64);
        $data = base64_decode($base64);
        
        $filename = 'audio_' . uniqid() . '.webm';
        $path = public_path('uploads/' . $filename);
        
        if (!is_dir(public_path('uploads'))) {
            mkdir(public_path('uploads'), 0755, true);
        }
        
        file_put_contents($path, $data);
        
        return response()->json([
            'url' => config('app.url') . '/uploads/' . $filename
        ]);
    }
}