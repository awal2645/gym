<?php

namespace App\Providers;

use App\Services\GoogleDriveTokenService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Only load channels if broadcasting is configured
        if (config('broadcasting.default') !== 'log' && config('broadcasting.default') !== 'null') {
            require base_path('routes/channels.php');
        }

        $this->registerGoogleDriveWithAutoRefresh();
    }

    /**
     * Register the Google Drive disk with automatic access token refresh.
     * You only need GOOGLE_DRIVE_REFRESH_TOKEN in .env; access token is refreshed and cached.
     */
    protected function registerGoogleDriveWithAutoRefresh(): void
    {
        Storage::extend('google', function ($app, $config) {
            $options = [];
            if (! empty($config['teamDriveId'] ?? null)) {
                $options['teamDriveId'] = $config['teamDriveId'];
            }

            $client = new \Google\Client;
            $client->setClientId($config['clientId']);
            $client->setClientSecret($config['clientSecret']);
            $client->setRedirectUri('urn:ietf:wg:oauth:2.0:oob');
            $client->setScopes([\Google\Service\Drive::DRIVE_FILE]);
            $client->setAccessType('offline');
            $client->setPrompt('consent');

            $tokenService = $app->make(GoogleDriveTokenService::class);
            $token = $tokenService->getValidTokenArray();
            if ($token !== null) {
                $client->setAccessToken($token);
            } else {
                $client->refreshToken($config['refreshToken'] ?? '');
            }

            $service = new \Google\Service\Drive($client);
            $adapter = new \Masbug\Flysystem\GoogleDriveAdapter($service, $config['folder'] ?? '/', $options);
            $driver = new \League\Flysystem\Filesystem($adapter);

            return new \Illuminate\Filesystem\FilesystemAdapter($driver, $adapter);
        });
    }
}
