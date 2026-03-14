<?php

namespace App\Mail;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NoReplyReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Message $message
    ) {}

    public function envelope(): Envelope
    {
        $senderName = $this->message->fromUser?->name ?? 'Joey';
        return new Envelope(
            subject: "You have an unread message from {$senderName} - JS Fitness",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.no-reply-reminder',
            with: ['chatMessage' => $this->message],
        );
    }
}
