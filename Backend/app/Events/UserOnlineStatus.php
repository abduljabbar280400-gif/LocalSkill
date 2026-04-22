<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserOnlineStatus implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $isOnline;
    public $lastSeen;

    public function __construct(int $userId, bool $isOnline, $lastSeen = null)
    {
        $this->userId = $userId;
        $this->isOnline = $isOnline;
        $this->lastSeen = $lastSeen ? (is_string($lastSeen) ? $lastSeen : $lastSeen->toIso8601String()) : null;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.status';
    }
}

