<?php

namespace App\Jobs;

use App\Mail\NoReplyReminderMail;
use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendNoReplyReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Message $message
    ) {}

    public function handle(): void
    {
        $message = $this->message->fresh(['fromUser', 'toUser']);
        if (!$message) {
            return;
        }

        // Don't email if message was seen (read) or recipient replied
        if ($message->read_at) {
            return; // They've seen it
        }

        $hasReplied = Message::where('from_user_id', $message->to_user_id)
            ->where('to_user_id', $message->from_user_id)
            ->where('created_at', '>', $message->created_at)
            ->exists();

        if ($hasReplied) {
            return; // They replied, no need to email
        }

        $recipient = $message->toUser;
        if (!$recipient || !$recipient->email) {
            return;
        }

        Mail::to($recipient->email)->send(new NoReplyReminderMail($message));
    }
}
