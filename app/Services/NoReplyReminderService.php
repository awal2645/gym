<?php

namespace App\Services;

use App\Mail\NoReplyReminderMail;
use App\Models\Message;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NoReplyReminderService
{
    /**
     * Send reminder email for a message if conditions are met.
     * Returns true if email was sent, false otherwise.
     */
    public static function sendIfNeeded(Message $message): bool
    {
        $message = $message->fresh(['fromUser', 'toUser']);
        if (!$message) {
            Log::info('[NoReplyReminder] Skip: message not found');
            return false;
        }

        if ($message->read_at) {
            Log::info('[NoReplyReminder] Skip: message already read', ['message_id' => $message->id]);
            return false;
        }

        if ($message->reminder_sent_at) {
            Log::info('[NoReplyReminder] Skip: reminder already sent', ['message_id' => $message->id]);
            return false;
        }

        $hasReplied = Message::where('from_user_id', $message->to_user_id)
            ->where('to_user_id', $message->from_user_id)
            ->where('created_at', '>', $message->created_at)
            ->exists();

        if ($hasReplied) {
            Log::info('[NoReplyReminder] Skip: recipient already replied', ['message_id' => $message->id]);
            return false;
        }

        $recipient = $message->toUser;
        if (!$recipient || !$recipient->email) {
            Log::info('[NoReplyReminder] Skip: no recipient or no email', [
                'message_id' => $message->id,
                'recipient_id' => $recipient->id ?? null,
            ]);
            return false;
        }

        try {
            Mail::to($recipient->email)->send(new NoReplyReminderMail($message));
            $message->update(['reminder_sent_at' => now()]);
            Log::info('[NoReplyReminder] Email sent', ['message_id' => $message->id, 'to' => $recipient->email]);
            return true;
        } catch (\Throwable $e) {
            Log::error('[NoReplyReminder] Send failed', ['message_id' => $message->id, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}
