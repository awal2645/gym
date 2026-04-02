<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New signup</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1a1a1a;">New user signup</h2>
    <p>Someone just registered:</p>
    <ul>
        <li><strong>Name:</strong> {{ $user->name }}</li>
        <li><strong>Email:</strong> {{ $user->email }}</li>
        <li><strong>User ID:</strong> {{ $user->id }}</li>
        <li><strong>Signed up at:</strong> {{ $user->created_at?->toDateTimeString() }}</li>
    </ul>
    <p><a href="{{ $frontendBaseUrl }}/admin/purchases">Open admin (purchases)</a></p>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">— {{ config('app.name') }}</p>
</body>
</html>
