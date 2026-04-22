<?php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversationId;
    public $lastMessage;
    public $unreadCount;
    public $receiverId;

    public function __construct(int $receiverId, int $conversationId, $lastMessage, int $unreadCount)
    {
        $this->receiverId = $receiverId;
        $this->conversationId = $conversationId;
        $this->lastMessage = $lastMessage;
        $this->unreadCount = $unreadCount;
    }

    public function broadcastOn(): array
    {
        \Illuminate\Support\Facades\Log::info("Broadcasting ConversationUpdated for User: " . $this->receiverId . " for Conv: " . $this->conversationId);
        return [
            new PrivateChannel('user.' . $this->receiverId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'conversation.updated';
    }
}
