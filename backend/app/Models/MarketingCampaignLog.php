<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketingCampaignLog extends Model
{
    protected $fillable = [
        'campaign_id',
        'user_id',
        'event_type', // sent, delivered, opened, clicked, bounced, complained, unsubscribed
        'channel', // email, sms, push
        'message_id',
        'ip_address',
        'user_agent',
        'link_url', // for clicks
        'bounce_reason', // for bounces
        'complaint_type', // for complaints
        'unsubscribe_method', // for unsubscribes
        'metadata',
        'occurred_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(MarketingCampaign::class, 'campaign_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
