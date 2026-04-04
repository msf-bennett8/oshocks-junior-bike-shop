<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MarketingCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'name',
        'type', // email, sms, push, mixed
        'status', // draft, scheduled, sending, completed, cancelled
        'template_id',
        'subject',
        'content',
        'audience_segment',
        'audience_count',
        'sent_count',
        'delivered_count',
        'opened_count',
        'clicked_count',
        'bounced_count',
        'complained_count',
        'unsubscribed_count',
        'scheduled_at',
        'started_at',
        'completed_at',
        'created_by',
        'ip_warmup', // gradual IP reputation building
    ];

    protected $casts = [
        'audience_segment' => 'array',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'ip_warmup' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function logs()
    {
        return $this->hasMany(MarketingCampaignLog::class, 'campaign_id');
    }
}
