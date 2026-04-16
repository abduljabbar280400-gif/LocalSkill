<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use SerializesModels;

    public $message;
    public $clientTempId;

    public function __construct($message, $clientTempId = null)
    {
        $this->message = $message;
        $this->clientTempId = $clientTempId;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('conversation.' . $this->message->conversation_id);
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->sender_id,
            'message' => $this->message->message,
            'is_seen' => $this->message->is_seen,
            'created_at' => $this->message->created_at,
            'client_temp_id' => $this->clientTempId,
            'is_delivered' => true
        ];
    }
}