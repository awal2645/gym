<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Admin\AdminPlanController;
use App\Http\Controllers\Admin\AdminPurchaseController;
use App\Http\Controllers\Admin\AdminChatController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/plans', [PlanController::class, 'index']);
Route::get('/plans/{id}', [PlanController::class, 'show']);

// Chat file stream (signed URL; no auth required for the GET request)
Route::get('/chat/file/{message}', [ChatController::class, 'streamFile'])->name('chat.file')->middleware('signed');

// Broadcasting auth route (must be before auth middleware)
Route::post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
})->middleware('auth:sanctum');

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/picture', [AuthController::class, 'uploadProfilePicture']);

    // Google Drive OAuth (connect / disconnect)
    Route::get('/google/redirect-url', [GoogleAuthController::class, 'redirectUrl']);
    Route::post('/google/disconnect', [GoogleAuthController::class, 'disconnect']);

    // Checkout
    Route::post('/checkout/create-order', [CheckoutController::class, 'createOrder']);
    Route::post('/checkout/capture-order', [CheckoutController::class, 'captureOrder']);

    // Purchases
    Route::get('/purchases/me', [PurchaseController::class, 'myPurchases']);

    // Chat
    Route::get('/chat/conversations/me', [ChatController::class, 'getConversations']);
    Route::get('/chat/messages/me', [ChatController::class, 'getMessages']);
    Route::post('/chat/messages', [ChatController::class, 'sendMessage']);
    Route::post('/chat/messages/{message}/trigger-reminder', [ChatController::class, 'triggerReminder']);
    // Chunked upload for large files (e.g. 1GB)
    Route::post('/chat/upload/init', [ChatController::class, 'uploadInit']);
    Route::post('/chat/upload/chunk', [ChatController::class, 'uploadChunk']);
    Route::post('/chat/upload/finalize', [ChatController::class, 'uploadFinalize']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Plans
        Route::get('/plans', [AdminPlanController::class, 'index']);
        Route::post('/plans', [AdminPlanController::class, 'store']);
        Route::put('/plans/{id}', [AdminPlanController::class, 'update']);
        Route::delete('/plans/{id}', [AdminPlanController::class, 'destroy']);

        // Purchases
        Route::get('/purchases', [AdminPurchaseController::class, 'index']);

        // Chat
        Route::get('/chat/users', [AdminChatController::class, 'getUsers']);
        Route::get('/chat/messages/{userId}', [AdminChatController::class, 'getMessages']);
        Route::post('/chat/messages/{userId}', [AdminChatController::class, 'sendMessage']);
        Route::post('/chat/reminder/{message}', [AdminChatController::class, 'triggerReminder']);
        Route::post('/chat/upload/{userId}/init', [AdminChatController::class, 'uploadInit']);
        Route::post('/chat/upload/{userId}/chunk', [AdminChatController::class, 'uploadChunk']);
        Route::post('/chat/upload/{userId}/finalize', [AdminChatController::class, 'uploadFinalize']);
    });
});
