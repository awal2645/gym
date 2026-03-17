<?php

use App\Http\Controllers\GoogleAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Google OAuth callback (must be before catch-all)
Route::get('/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

// Password reset - required by Laravel's Password::sendResetLink notification
// Redirects to SPA reset page with token & email as query params
Route::get('/reset-password/{token}', function (Request $request, string $token) {
    $email = $request->query('email');
    $query = 'token=' . urlencode($token);
    if ($email) {
        $query .= '&email=' . urlencode($email);
    }
    return redirect('/reset-password?' . $query);
})->name('password.reset');

// Serve React app - root redirects to login
Route::get('/', function () {
    return redirect('/login');
});

// Catch-all route for React Router (must be last)
Route::get('/{path}', function () {
    return view('welcome');
})->where('path', '.*')->name('react');
