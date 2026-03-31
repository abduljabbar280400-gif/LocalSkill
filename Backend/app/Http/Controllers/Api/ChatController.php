<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;

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

        $request->validate([
            'message' => 'required|string|max:2000'
        ]);

        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => auth()->id(),
            'message' => $request->message,
            'is_seen' => false
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message
        ], 201);
    }

  public function updateLastSeen(Request $request)
{
    $user = $request->user();
    $user->last_seen = now();
    $user->save();

    return response()->json(['status' => 'updated']);
}
}