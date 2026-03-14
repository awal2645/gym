<?php

namespace App\Console\Commands;

use App\Jobs\SendNoReplyReminderJob;
use App\Mail\TestReminderMail;
use App\Models\Message;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestReminderMailCommand extends Command
{
    protected $signature = 'mail:test-reminder
                            {email? : Email to send test reminder (default: mdabdulawal2645@gmail.com)}
                            {--queue : Dispatch real reminder job to queue instead of sending simple test email}';

    protected $description = 'Send a test reminder email. Use --queue to dispatch real job (requires message where recipient has that email).';

    public function handle(): int
    {
        $email = $this->argument('email') ?: 'mdabdulawal2645@gmail.com';
        $email = trim($email);

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error("Invalid email: {$email}");
            return self::FAILURE;
        }

        $this->line('MAIL_MAILER=' . config('mail.default'));
        if (config('mail.default') === 'log') {
            $this->warn('MAIL_MAILER=log - emails go to storage/logs. Set MAIL_MAILER=smtp in .env for real delivery.');
        }

        if ($this->option('queue')) {
            return $this->dispatchQueueTest($email);
        }

        $this->info("Sending simple test email to: {$email}");
        try {
            Mail::to($email)->send(new TestReminderMail());
            $this->info('Test email sent.');
        } catch (\Throwable $e) {
            $this->error('Failed: ' . $e->getMessage());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    private function dispatchQueueTest(string $email): int
    {
        $recipient = User::where('email', $email)->first();
        if (! $recipient) {
            $this->error("No user with email {$email}. Create the user first.");
            return self::FAILURE;
        }

        $message = Message::where('to_user_id', $recipient->id)
            ->whereNull('read_at')
            ->oldest()
            ->first();

        if (! $message) {
            $this->error("No unread message for {$email}. Send a message TO this user first, then run with --queue.");
            return self::FAILURE;
        }

        $this->info("Dispatching SendNoReplyReminderJob for message #{$message->id} (recipient: {$email})");
        SendNoReplyReminderJob::dispatch($message);
        $this->info('Job queued. Run "php artisan queue:work" to process. Email will go to: ' . $email);
        return self::SUCCESS;
    }
}
