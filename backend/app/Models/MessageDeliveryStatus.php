<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageDeliveryStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'user_id',
        'status',       // delivered | read
        'delivered_at',
        'read_at',
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    protected $keyType = 'string';

    public function message()
    {
        return $this->belongsTo(Message::class, 'message_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
