<?php

namespace App\Console\Commands;

use App\Services\GoogleDriveService;
use Illuminate\Console\Command;

class GoogleDriveSetupFolder extends Command
{
    protected $signature = 'drive:setup-folder
                            {--drive-id= : Shared Drive root folder ID (from URL when you open the Shared Drive). If omitted, uses GOOGLE_DRIVE_SHARED_DRIVE_ID from .env}';

    protected $description = 'Create a "Chat Videos" folder in your Shared Drive and output the folder ID for GOOGLE_DRIVE_FOLDER_ID';

    public function handle(): int
    {
        $driveId = $this->option('drive-id') ?: config('services.google_drive.shared_drive_id');
        $driveId = trim((string) $driveId);
        if (str_contains($driveId, 'drive.google.com') && preg_match('#/folders/([a-zA-Z0-9_-]+)#', $driveId, $m)) {
            $driveId = $m[1];
        }
        if ($driveId === '') {
            $this->error('Shared Drive ID is required.');
            $this->line('1. Open your Shared Drive in the browser (not a folder inside it).');
            $this->line('2. Copy the ID from the URL: https://drive.google.com/drive/folders/<THIS_ID>');
            $this->line('3. Run: php artisan drive:setup-folder --drive-id=<THIS_ID>');
            $this->line('   Or set GOOGLE_DRIVE_SHARED_DRIVE_ID=<THIS_ID> in .env and run: php artisan drive:setup-folder');
            return self::FAILURE;
        }

        try {
            $service = app(GoogleDriveService::class);
            $folderId = $service->createFolder($driveId);
        } catch (\Throwable $e) {
            $this->error('Error: ' . $e->getMessage());
            if (str_contains($e->getMessage(), 'parentNotAFolder') || str_contains($e->getMessage(), 'not a folder')) {
                $this->line('Use the Shared Drive root folder ID from the URL when you open the Shared Drive (not a file).');
            } elseif (str_contains($e->getMessage(), '404') || str_contains($e->getMessage(), 'notFound')) {
                $this->line('Ensure the service account is added to the Shared Drive as Content manager.');
            }
            return self::FAILURE;
        }

        $this->info('Created folder "Chat Videos" in your Shared Drive.');
        $this->newLine();
        $this->info('Add this to your .env file:');
        $this->line('GOOGLE_DRIVE_FOLDER_ID=' . $folderId);
        $this->newLine();

        return self::SUCCESS;
    }
}
