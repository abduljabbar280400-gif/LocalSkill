<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'message',
        'is_seen',
        'is_delivered',
        'seen_at',
    ];

    protected $casts = [
        'is_seen'      => 'boolean',
        'is_delivered' => 'boolean',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}