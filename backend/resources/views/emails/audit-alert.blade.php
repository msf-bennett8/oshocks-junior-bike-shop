<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .alert-box { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; margin: 20px 0; }
        .critical { background: #f8d7da; border-color: #dc3545; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #495057; }
    </style>
</head>
<body>
    <h2>🚨 Security Alert</h2>
    
    <div class="alert-box {{ $auditLog->severity === 'CRITICAL' ? 'critical' : '' }}">
        <h3>{{ $auditLog->event_type }}</h3>
        <p><strong>Risk Score:</strong> {{ $riskScore }}/100</p>
    </div>

    <div class="detail">
        <span class="label">Description:</span> {{ $auditLog->description }}
    </div>
    
    <div class="detail">
        <span class="label">Severity:</span> {{ $auditLog->severity }}
    </div>
    
    <div class="detail">
        <span class="label">Category:</span> {{ $auditLog->event_category }}
    </div>
    
    <div class="detail">
        <span class="label">User ID:</span> {{ $auditLog->user_id ?? 'N/A' }}
    </div>
    
    <div class="detail">
        <span class="label">IP Address:</span> {{ $auditLog->ip_address ?? 'N/A' }}
    </div>
    
    <div class="detail">
        <span class="label">Time:</span> {{ $auditLog->occurred_at }}
    </div>

    <hr>
    
    <p>
        <a href="{{ config('app.url') }}/admin/audit-logs/{{ $auditLog->id }}">
            View in Dashboard
        </a>
    </p>
</body>
</html>
