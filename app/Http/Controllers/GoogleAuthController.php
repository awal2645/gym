<?php

namespace App\Http\Controllers;

use App\Models\User;
use Google\Client as GoogleClient;
use Google\Service\Drive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    /**
     * Return Google OAuth URL for "Connect Google Drive". Frontend redirects user to this URL.
     */
    public function redirectUrl(Request $request)
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = config('services.google.redirect_uri');

        if (empty($clientId) || empty($clientSecret)) {
            return response()->json(['message' => 'Google OAuth is not configured.'], 500);
        }

        $state = Str::random(64);
        Cache::put('google_oauth_state_' . $state, $request->user()->id, now()->addMinutes(10));

        $client = $this->createOAuthClient($redirectUri);
        $client->setState($state);
        $url = $client->createAuthUrl();

        return response()->json(['url' => $url]);
    }

    /**
     * OAuth callback: exchange code for tokens and save to user. Then redirect to frontend.
     */
    public function callback(Request $request)
    {
        $code = $request->query('code');
        $state = $request->query('state');
        $error = $request->query('error');

        $base = rtrim(config('app.url', 'http://127.0.0.1:8000'), '/');

        if ($error) {
            Log::warning('Google OAuth error', ['error' => $error]);
            return redirect()->to($base . '/profile?google_error=' . urlencode($error));
        }

        if (empty($code) || empty($state)) {
            return redirect()->to($base . '/profile?google_error=missing_code');
        }

        $userId = Cache::pull('google_oauth_state_' . $state);
        if (!$userId) {
            return redirect()->to($base . '/profile?google_error=invalid_state');
        }

        $user = User::find($userId);
        if (!$user) {
            return redirect()->to($base . '/profile?google_error=user_not_found');
        }

        $redirectUri = config('services.google.redirect_uri');
        $client = $this->createOAuthClient($redirectUri);

        try {
            $accessToken = $client->fetchAccessTokenWithAuthCode($code);
        } catch (\Throwable $e) {
            Log::error('Google OAuth token exchange failed', ['error' => $e->getMessage()]);
            return redirect()->to($base . '/profile?google_error=token_exchange_failed');
        }

        if (isset($accessToken['error'])) {
            Log::warning('Google OAuth token error', ['error' => $accessToken['error']]);
            return redirect()->to($base . '/profile?google_error=' . urlencode($accessToken['error'] ?? 'unknown'));
        }

        $user->google_access_token = $accessToken['access_token'];
        $user->google_refresh_token = $accessToken['refresh_token'] ?? $user->google_refresh_token;
        $user->google_token_expires_at = isset($accessToken['expires_in'])
            ? now()->addSeconds((int) $accessToken['expires_in'])
            : null;
        $user->save();

        return redirect()->to($base . '/profile?google_connected=1');
    }

    /**
     * Disconnect Google Drive (clear tokens).
     */
    public function disconnect(Request $request)
    {
        $user = $request->user();
        $user->google_access_token = null;
        $user->google_refresh_token = null;
        $user->google_token_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Google Drive disconnected.']);
    }

    protected function createOAuthClient(string $redirectUri): GoogleClient
    {
        $client = new GoogleClient();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri($redirectUri);
        $client->addScope(Drive::DRIVE_FILE);
        $client->addScope(Drive::DRIVE);
        $client->setAccessType('offline');
        $client->setPrompt('consent');
        return $client;
    }
}
