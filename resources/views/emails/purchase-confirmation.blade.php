<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase confirmed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1a1a1a;">Thank you for your purchase</h2>
    <p>Hi {{ $purchase->user->name }},</p>
    <p>Your payment was received. Here’s a summary:</p>
    <ul>
        <li><strong>Plan:</strong> {{ $purchase->plan->name ?? 'Coaching plan' }}</li>
        <li><strong>Amount:</strong> ${{ number_format((float) $purchase->amount, 2) }} {{ $purchase->currency ?? 'USD' }}</li>
        @if($purchase->paid_at)
            <li><strong>Paid at:</strong> {{ $purchase->paid_at->toDateTimeString() }}</li>
        @endif
    </ul>
    <p>View your plan and history anytime:</p>
    <p><a href="{{ $frontendBaseUrl }}/account">{{ $frontendBaseUrl }}/account</a></p>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">— {{ config('app.name') }}</p>
</body>
</html>
