<?php

use App\Http\Controllers\GoogleAuthController;
use Illuminate\Support\Facades\Route;

// Google OAuth callback (must be before catch-all)
Route::get('/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

// Serve React app - root redirects to login
Route::get('/', function () {
    return redirect('/login');
});

// Catch-all route for React Router (must be last)
Route::get('/{path}', function () {
    return view('welcome');
})->where('path', '.*')->name('react');
