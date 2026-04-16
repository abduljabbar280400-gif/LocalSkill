<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Events\MessageSeen;
use App\Events\UserOnlineStatus;
use App\Events\MessageDelivered;



class ChatController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Get Conversation By Contract
    |--------------------------------------------------------------------------
    */
    public function getConversation($contractId)
    {
        $conversation = Conversation::where('contract_id', $contractId)->first();

        if (!$conversation) {
            return response()->json([
                'message' => 'Conversation not found'
            ], 404);
        }

        // Security check
        if (
            auth()->id() !== $conversation->client_id &&
            auth()->id() !== $conversation->freelancer_id
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json($conversation);
    }

    /*
    |--------------------------------------------------------------------------
    | Get Messages
    |--------------------------------------------------------------------------
    */
    public function getMessages($conversationId)
{
    $conversation = Conversation::find($conversationId);

    if (!$conversation) {
        return response()->json([
            'message' => 'Conversation not found'
        ], 404);
    }

    // Security check
    if (
        auth()->id() !== $conversation->client_id &&
        auth()->id() !== $conversation->freelancer_id
    ) {
        return response()->json([
            'message' => 'Unauthorized'
        ], 403);
    }

    $messages = Message::where('messages.conversation_id', $conversationId)
        ->join('users', 'messages.sender_id', '=', 'users.id')
        ->orderBy('messages.created_at', 'asc')
        ->select(
            'messages.*',
            'users.last_seen as sender_last_seen'
        )
        ->get();

    return response()->json($messages);
}

    /*
    |--------------------------------------------------------------------------
    | Send Message
    |--------------------------------------------------------------------------
    */
    public function sendMessage(Request $request, $conversationId)
{
    $conversation = Conversation::find($conversationId);

    if (!$conversation) {
        return response()->json(['message' => 'Conversation not found'], 404);
    }

    if (
        auth()->id() !== $conversation->client_id &&
        auth()->id() !== $conversation->freelancer_id
    ) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $request->validate([
        'message' => 'required|string|max:2000',
        'client_temp_id' => 'nullable'
    ]);

    $message = Message::create([
        'conversation_id' => $conversationId,
        'sender_id' => auth()->id(),
        'message' => $request->message,
        'is_seen' => false,
        'is_delivered' => false
    ]);

    broadcast(new MessageSent($message, $request->client_temp_id))->toOthers();

    return response()->json(['data' => $message], 201);
}

  public function updateLastSeen(Request $request)
{
    $user = $request->user();
    $user->last_seen = now();
    $user->save();

    return response()->json(['status' => 'updated']);
}

public function typing(Request $request)
{
    broadcast(new UserTyping(
        $request->conversation_id,
        auth()->id()
    ))->toOthers();

    return response()->json(['status' => 'typing']);
}

public function markSeen($conversationId)
{
    $conversation = Conversation::find($conversationId);

    if (!$conversation) {
        return response()->json(['message' => 'Conversation not found'], 404);
    }

    Message::where('conversation_id', $conversationId)
        ->where('sender_id', '!=', auth()->id())
        ->where('is_seen', false)
        ->update([
            'is_seen' => true,
            'seen_at' => now()
        ]);

    broadcast(new MessageSeen($conversationId, auth()->id()))->toOthers();

    return response()->json(['success' => true]);
}

public function setOnline(Request $request)
{
    broadcast(new UserOnlineStatus(
        auth()->id(),
        true,
        $request->conversation_id
    ))->toOthers();

    return response()->json(['status' => 'online']);
}

public function setOffline(Request $request)
{
    broadcast(new UserOnlineStatus(
        auth()->id(),
        false,
        $request->conversation_id
    ))->toOthers();

    return response()->json(['status' => 'offline']);
}

public function markDelivered($conversationId)
{
    Message::where('conversation_id', $conversationId)
        ->where('sender_id', '!=', auth()->id())
        ->where('is_delivered', false)
        ->update([
            'is_delivered' => true
        ]);

    broadcast(new MessageDelivered($conversationId))->toOthers();

    return response()->json(['status' => 'delivered']);
}

}