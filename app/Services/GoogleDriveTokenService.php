<?php

namespace App\Services;

use Google\Client;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GoogleDriveTokenService
{
    /** Cache key for stored token. */
    protected const CACHE_KEY = 'google_drive_access_token';

    /** Consider token expired this many seconds before actual expiry. */
    protected const EXPIRY_BUFFER = 300;

    /**
     * Return a valid access token (from cache or by refreshing). Uses only refresh token from config.
     */
    public function getValidAccessToken(): ?string
    {
        $config = config('filesystems.disks.google', []);
        $clientId = $config['clientId'] ?? null;
        $clientSecret = $config['clientSecret'] ?? null;
        $refreshToken = $config['refreshToken'] ?? null;

        if (empty($clientId) || empty($clientSecret) || empty($refreshToken)) {
            return null;
        }

        $cached = $this->getCachedToken();
        if ($cached !== null && $this->isTokenValid($cached)) {
            return $cached['access_token'];
        }

        $client = new Client;
        $client->setClientId($clientId);
        $client->setClientSecret($clientSecret);
        $client->setRedirectUri('urn:ietf:wg:oauth:2.0:oob');
        $client->setScopes(['https://www.googleapis.com/auth/drive.file']);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        try {
            $creds = $client->fetchAccessTokenWithRefreshToken($refreshToken);
        } catch (\Throwable $e) {
            Log::error('Google Drive token refresh failed', ['message' => $e->getMessage()]);
            return null;
        }

        if (empty($creds['access_token'])) {
            Log::warning('Google Drive token refresh returned no access_token', ['creds' => array_diff_key($creds ?? [], ['access_token' => 1])]);
            return null;
        }

        $this->cacheToken($creds);

        return $creds['access_token'];
    }

    /**
     * Get full token array for setting on Google Client (so it can auto-refresh later if needed).
     */
    public function getValidTokenArray(): ?array
    {
        $config = config('filesystems.disks.google', []);
        $clientId = $config['clientId'] ?? null;
        $clientSecret = $config['clientSecret'] ?? null;
        $refreshToken = $config['refreshToken'] ?? null;

        if (empty($clientId) || empty($clientSecret) || empty($refreshToken)) {
            return null;
        }

        $cached = $this->getCachedToken();
        if ($cached !== null && $this->isTokenValid($cached)) {
            return $cached;
        }

        $client = new Client;
        $client->setClientId($clientId);
        $client->setClientSecret($clientSecret);
        $client->setRedirectUri('urn:ietf:wg:oauth:2.0:oob');
        $client->setScopes(['https://www.googleapis.com/auth/drive.file']);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        try {
            $creds = $client->fetchAccessTokenWithRefreshToken($refreshToken);
        } catch (\Throwable $e) {
            Log::error('Google Drive token refresh failed', ['message' => $e->getMessage()]);
            return null;
        }

        if (empty($creds['access_token'])) {
            return null;
        }

        if (! isset($creds['created'])) {
            $creds['created'] = time();
        }
        if (! isset($creds['refresh_token'])) {
            $creds['refresh_token'] = $refreshToken;
        }

        $this->cacheToken($creds);

        return $creds;
    }

    protected function getCachedToken(): ?array
    {
        $data = Cache::get(self::CACHE_KEY);
        if (! is_array($data)) {
            return null;
        }
        return $data;
    }

    protected function isTokenValid(array $token): bool
    {
        $expiresIn = (int) ($token['expires_in'] ?? 3600);
        $created = (int) ($token['created'] ?? 0);
        $expiresAt = $created + $expiresIn - self::EXPIRY_BUFFER;
        return time() < $expiresAt;
    }

    protected function cacheToken(array $creds): void
    {
        $ttl = max(60, (int) ($creds['expires_in'] ?? 3600) - self::EXPIRY_BUFFER);
        Cache::put(self::CACHE_KEY, $creds, $ttl);
    }
}
