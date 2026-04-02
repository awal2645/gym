<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1a1a1a;">Welcome, {{ $user->name }}!</h2>
    <p>Thanks for creating your account. Here’s a quick reference (placeholder details you can customize in the app):</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Login email</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">{{ $user->email }}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Password</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">[The password you chose at signup — we don’t store plain-text passwords. If you forget it, use “Forgot password” on the login page.]</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Dashboard</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="{{ $frontendBaseUrl }}/dashboard">{{ $frontendBaseUrl }}/dashboard</a></td>
        </tr>
        <tr>
            <td style="padding: 8px 0;"><strong>Account &amp; purchases</strong></td>
            <td style="padding: 8px 0;"><a href="{{ $frontendBaseUrl }}/account">{{ $frontendBaseUrl }}/account</a></td>
        </tr>
    </table>

    <h3 style="color: #1a1a1a;">What happens next</h3>
    <ol style="padding-left: 20px;">
        <li>Log in with your email and the password you created.</li>
        <li>Review your dashboard and account to confirm your profile.</li>
        <li>Pick a coaching plan on pricing when you’re ready; after purchase, your active plan appears under Account.</li>
        <li>Use chat to send form videos — we’ll align on turnaround in your plan details.</li>
    </ol>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">— {{ config('app.name') }}</p>
</body>
</html>
