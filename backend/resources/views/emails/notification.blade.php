<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $title }}</h1>
        </div>
        
        <div class="content">
            <p>{{ $message }}</p>
            
            @if($actionUrl)
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{{ $actionUrl }}" class="button">{{ $actionText ?? 'View Details' }}</a>
                </p>
            @endif
        </div>
        
        <div class="footer">
            <p>© {{ date('Y') }} Oshocks. All rights reserved.</p>
            <p>
                <a href="{{ url('/settings/notifications') }}">Notification Settings</a> | 
                <a href="{{ url('/unsubscribe') }}">Unsubscribe</a>
            </p>
        </div>
    </div>
    
    {{-- Tracking pixel for open tracking --}}
    <img src="{{ url('/api/v1/notifications/pixel/' . ($notificationId ?? 'unknown')) }}" width="1" height="1" alt="" />
</body>
</html>
