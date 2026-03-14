<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>@yield('title', config('app.name', 'Gym Trainer'))</title>
        @if(url()->current() !== 'http://127.0.0.1:8000')
            @viteReactRefresh
        @endif
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @stack('styles')
    </head>
    <body>
        <div id="app">
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif;">
                <div style="text-align: center;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <p style="color: #666;">Loading application...</p>
                </div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
        @stack('scripts')
    </body>
</html>
