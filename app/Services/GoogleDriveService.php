<?php

namespace App\Services;

use App\Models\User;
use Google\Client as GoogleClient;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Service\Drive\Permission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class GoogleDriveService
{
    protected ?Drive $drive = null;

    /** @var string|null 'service_account' | 'user' */
    protected ?string $driveClientType = null;

    /**
     * Resolve credentials path to an absolute path (so relative paths like "public/foo.json" work).
     */
    protected function getCredentialsPath(): ?string
    {
        $path = config('services.google_drive.credentials');
        if (empty($path)) {
            return null;
        }
        if (!str_starts_with($path, '/') && !preg_match('#^[A-Za-z]:[\\\\/]#', $path)) {
            $path = base_path($path);
        }
        return $path;
    }

    /**
     * Normalize folder ID: accept raw ID or full Drive folder URL (extract ID from URL).
     */
    protected function getFolderId(): string
    {
        $raw = trim((string) config('services.google_drive.folder_id'));
        if ($raw === '') {
            return '';
        }
        // Extract folder ID from URL like https://drive.google.com/drive/folders/1ABC... or .../u/0/folders/1ABC...
        if (str_contains($raw, 'drive.google.com') && preg_match('#/folders/([a-zA-Z0-9_-]+)#', $raw, $m)) {
            return $m[1];
        }
        // Already a raw ID (alphanumeric, dashes, underscores)
        return $raw;
    }

    /**
     * Get or create the Drive API service instance (service account).
     */
    protected function getDrive(): Drive
    {
        if ($this->drive !== null && $this->driveClientType === 'service_account') {
            return $this->drive;
        }

        $credentialsPath = $this->getCredentialsPath();
        if (empty($credentialsPath) || !is_readable($credentialsPath)) {
            throw new \RuntimeException('Google Drive credentials file not found or not readable. Set GOOGLE_APPLICATION_CREDENTIALS in .env.');
        }

        $client = new GoogleClient();
        $client->setAuthConfig($credentialsPath);
        $client->addScope(Drive::DRIVE_FILE);
        $client->addScope(Drive::DRIVE);
        $client->setApplicationName(config('app.name'));

        $this->drive = new Drive($client);
        $this->driveClientType = 'service_account';

        return $this->drive;
    }

    /**
     * Get Drive API service using the user's OAuth tokens. Refreshes access token if expired.
     */
    public function getDriveForUser(User $user): Drive
    {
        if (empty($user->google_refresh_token)) {
            throw new \RuntimeException('User has not connected Google Drive.');
        }

        $client = new GoogleClient();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->addScope(Drive::DRIVE_FILE);
        $client->addScope(Drive::DRIVE);
        $client->setAccessToken([
            'access_token' => $user->google_access_token,
            'refresh_token' => $user->google_refresh_token,
            'expires_in' => $user->google_token_expires_at ? $user->google_token_expires_at->diffInSeconds(now()) : 0,
        ]);

        if ($client->isAccessTokenExpired()) {
            $client->fetchAccessTokenWithRefreshToken($user->google_refresh_token);
            $token = $client->getAccessToken();
            $user->google_access_token = $token['access_token'];
            $user->google_token_expires_at = isset($token['expires_in'])
                ? now()->addSeconds((int) $token['expires_in'])
                : null;
            $user->save();
        }

        return new Drive($client);
    }

    /**
     * Get the user whose Google Drive receives all chat video uploads (OAuth only, no service account).
     * Prefers an admin; otherwise the first user who connected Google.
     */
    public function getDriveOwnerUser(): ?User
    {
        return User::whereNotNull('google_refresh_token')
            ->orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END")
            ->first();
    }

    /**
     * Upload a video to the Drive owner's Google account (OAuth). No service account needed.
     * One user (e.g. you or an admin) connects Google in Profile; all uploads go to that Drive.
     */
    public function uploadVideo(UploadedFile $file, ?User $user = null): array
    {
        $owner = $this->getDriveOwnerUser();
        if (!$owner) {
            throw new \RuntimeException(
                'No one has connected Google Drive. Go to Profile → Connect Google Drive (use the account where you want videos saved), then try again.'
            );
        }
        return $this->uploadVideoWithUser($file, $owner);
    }

    /**
     * Upload using the user's Google Drive (OAuth). File goes to their My Drive root.
     */
    protected function uploadVideoWithUser(UploadedFile $file, User $user): array
    {
        $drive = $this->getDriveForUser($user);
        $fileName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $content = file_get_contents($file->getRealPath());

        $driveFile = new DriveFile();
        $driveFile->setName($fileName);
        $driveFile->setMimeType($mimeType);
        // No parents = user's My Drive root

        $created = $drive->files->create($driveFile, [
            'data' => $content,
            'mimeType' => $mimeType,
            'uploadType' => 'multipart',
        ]);

        $fileId = $created->getId();

        $permission = new Permission();
        $permission->setType('anyone');
        $permission->setRole('reader');
        try {
            $drive->permissions->create($fileId, $permission);
        } catch (\Exception $e) {
            Log::warning('Google Drive: could not set public permission for file ' . $fileId, ['error' => $e->getMessage()]);
        }

        $viewUrl = 'https://drive.google.com/file/d/' . $fileId . '/view?usp=sharing';
        $embedUrl = 'https://drive.google.com/file/d/' . $fileId . '/preview';

        return [
            'file_id' => $fileId,
            'view_url' => $viewUrl,
            'embed_url' => $embedUrl,
        ];
    }

    /**
     * Upload using service account into the configured Shared Drive folder.
     */
    protected function uploadVideoWithServiceAccount(UploadedFile $file): array
    {
        $drive = $this->getDrive();
        $folderId = $this->getFolderId();
        if ($folderId === '') {
            throw new \RuntimeException(
                'GOOGLE_DRIVE_FOLDER_ID is not set. Create a folder in your Google Drive, share it with the service account (client_email in your JSON) as Editor, then set the folder ID in .env.'
            );
        }

        $fileName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $content = file_get_contents($file->getRealPath());

        $driveFile = new DriveFile();
        $driveFile->setName($fileName);
        $driveFile->setMimeType($mimeType);
        $driveFile->setParents([$folderId]);

        try {
            $created = $drive->files->create($driveFile, [
                'data' => $content,
                'mimeType' => $mimeType,
                'uploadType' => 'multipart',
                'supportsAllDrives' => true,
            ]);
        } catch (\Google\Service\Exception $e) {
            if (str_contains($e->getMessage(), 'storageQuotaExceeded') || str_contains($e->getMessage(), 'do not have storage quota')) {
                throw new \RuntimeException(
                    'The folder ID is in the service account\'s Drive (no quota). Use a folder in YOUR My Drive instead: ' .
                    'Create a new folder in drive.google.com (My Drive), Share it with gym-799@gym-joye.iam.gserviceaccount.com as Editor, then set GOOGLE_DRIVE_FOLDER_ID to that folder\'s ID from the URL.'
                );
            }
            throw $e;
        }

        $fileId = $created->getId();

        $permission = new Permission();
        $permission->setType('anyone');
        $permission->setRole('reader');
        try {
            $drive->permissions->create($fileId, $permission, ['supportsAllDrives' => true]);
        } catch (\Exception $e) {
            Log::warning('Google Drive: could not set public permission for file ' . $fileId, ['error' => $e->getMessage()]);
        }

        $viewUrl = 'https://drive.google.com/file/d/' . $fileId . '/view?usp=sharing';
        $embedUrl = 'https://drive.google.com/file/d/' . $fileId . '/preview';

        return [
            'file_id' => $fileId,
            'view_url' => $viewUrl,
            'embed_url' => $embedUrl,
        ];
    }

    /**
     * Create a folder inside the given parent (Shared Drive root or folder ID). Returns the new folder ID or null on failure.
     */
    public function createFolder(string $parentId, string $name = 'Chat Videos'): ?string
    {
        $drive = $this->getDrive();
        $file = new DriveFile();
        $file->setName($name);
        $file->setMimeType('application/vnd.google-apps.folder');
        $file->setParents([$parentId]);
        $created = $drive->files->create($file, ['supportsAllDrives' => true]);
        return $created->getId();
    }

    /**
     * Whether Drive uploads can run: OAuth credentials exist and at least one user has connected Google.
     */
    public function isConfigured(): bool
    {
        if (empty(config('services.google.client_id')) || empty(config('services.google.client_secret'))) {
            return false;
        }
        return $this->getDriveOwnerUser() !== null;
    }
}
