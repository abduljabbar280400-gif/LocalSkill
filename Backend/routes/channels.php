<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{id}', function ($user, $id) {
    $conversation = Conversation::find($id);

    if (!$conversation) {
        \Illuminate\Support\Facades\Log::warning("Broadcasting auth failed: Conversation {$id} not found.");
        return false;
    }

    $isAuthorized = (int) $user->id === (int) $conversation->client_id ||
                    (int) $user->id === (int) $conversation->freelancer_id;

    if (!$isAuthorized) {
        \Illuminate\Support\Facades\Log::warning("Broadcasting auth failed: User {$user->id} is not part of conversation {$id}. Client: {$conversation->client_id}, Freelancer: {$conversation->freelancer_id}");
    }

    return $isAuthorized;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    // A user can always listen to their own status
    if ((int) $user->id === (int) $id) return true;

    // A user can listen to another user's status if they are in a shared conversation
    return \App\Models\Conversation::where(function($q) use ($user, $id) {
        $q->where('client_id', $user->id)->where('freelancer_id', $id);
    })->orWhere(function($q) use ($user, $id) {
        $q->where('freelancer_id', $user->id)->where('client_id', $id);
    })->exists();
});