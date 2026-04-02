<?php

namespace App\Services;

use App\Mail\AdminNewUserNotificationMail;
use App\Mail\PurchaseConfirmationMail;
use App\Mail\WelcomeUserMail;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailNotificationService
{
    public function frontendUrl(): string
    {
        $url = rtrim((string) config('app.frontend_url'), '/');

        return $url !== '' ? $url : rtrim((string) config('app.url'), '/');
    }

    public function sendWelcomeEmail(User $user): void
    {
        try {
            $front = $this->frontendUrl();
            Mail::to($user->email)->send(new WelcomeUserMail($user, $front));
        } catch (\Throwable $e) {
            Log::error('Welcome email failed', [
                'user_id' => $user->id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function notifyAdminsNewUser(User $user): void
    {
        $to = config('mail.admin_notification_address');
        if (! $to) {
            return;
        }

        try {
            $front = $this->frontendUrl();
            Mail::to($to)->send(new AdminNewUserNotificationMail($user, $front));
        } catch (\Throwable $e) {
            Log::error('Admin new-user notification failed', [
                'user_id' => $user->id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function sendPurchaseConfirmation(Purchase $purchase): void
    {
        $purchase->loadMissing(['user', 'plan']);
        $user = $purchase->user;
        if (! $user?->email) {
            return;
        }

        try {
            $front = $this->frontendUrl();
            Mail::to($user->email)->send(new PurchaseConfirmationMail($purchase, $front));
        } catch (\Throwable $e) {
            Log::error('Purchase confirmation email failed', [
                'purchase_id' => $purchase->id,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
