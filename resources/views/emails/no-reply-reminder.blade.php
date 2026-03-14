<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You have an unread message</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1a1a1a;">You have an unread message</h2>
    <p>Hi {{ $chatMessage->toUser->name ?? 'there' }},</p>
    <p><strong>{{ $chatMessage->fromUser->name ?? 'Joey' }}</strong> sent you a message {{ $chatMessage->created_at->diffForHumans() }} and you haven't seen it yet.</p>
    @if($chatMessage->body)
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; white-space: pre-wrap;">{{ Str::limit($chatMessage->body, 200) }}</p>
        </div>
    @elseif($chatMessage->file_name)
        <p>They shared a file: <strong>{{ $chatMessage->file_name }}</strong></p>
    @endif
    <p>
        <a href="{{ config('app.url') }}/{{ $chatMessage->toUser->role === 'admin' ? 'admin/chat' : 'chat' }}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">View message</a>
    </p>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">— JS Fitness Form Checker</p>
</body>
</html>
