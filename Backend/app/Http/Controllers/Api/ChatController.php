<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Events\MessageSent;
use App\Events\MessageDelivered;
use App\Events\MessageSeen;
use App\Events\UserOnlineStatus;
use Laravel\Sanctum\PersonalAccessToken;

class ChatController extends Controller
{
    /* ── Conversations ───────────────────────────────────────────────────────── */

    public function getConversation(Request $request, int $contractId): JsonResponse
    {
        $conversation = Conversation::where('contract_id', $contractId)->first();
        if (!$conversation) return response()->json(['message' => 'Not found'], 404);

        $userId = auth()->id();
        if ($userId !== $conversation->client_id && $userId !== $conversation->freelancer_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $otherUserId = ($userId === $conversation->client_id) ? $conversation->freelancer_id : $conversation->client_id;
        $otherUser = User::find($otherUserId);
        
        $conversation->other_user = $otherUser ? [
            'id'        => $otherUser->id,
            'full_name' => trim($otherUser->title . ' ' . $otherUser->first_name . ' ' . $otherUser->last_name),
            'is_online' => (bool)$otherUser->is_online,
            'last_seen' => $otherUser->last_seen ? $otherUser->last_seen->toIso8601String() : null,
        ] : null;

        return response()->json($conversation);
    }

    public function getUserConversations(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $conversations = Conversation::with('contract')
            ->where('client_id', $userId)
            ->orWhere('freelancer_id', $userId)
            ->get();

        $data = [];
        foreach ($conversations as $conv) {
            $otherUserId = ($conv->client_id === $userId) ? $conv->freelancer_id : $conv->client_id;
            $otherUser = User::find($otherUserId);
            if (!$otherUser) continue;

            $lastMessage = Message::where('conversation_id', $conv->id)->latest()->first();
            $unreadCount = Message::where('conversation_id', $conv->id)->where('sender_id', '!=', $userId)->where('is_seen', false)->count();

            $data[] = [
                'id'            => $conv->id,
                'contract_id'   => $conv->contract_id,
                'project_title' => $conv->contract ? $conv->contract->project_title : 'Unknown',
                'other_user'    => [
                    'id'         => $otherUser->id,
                    'name'       => trim($otherUser->title . ' ' . $otherUser->first_name . ' ' . $otherUser->last_name),
                    'is_online'  => (bool)$otherUser->is_online,
                    'last_seen'  => $otherUser->last_seen ? $otherUser->last_seen->toIso8601String() : null,
                ],
                'last_message'  => $lastMessage,
                'unread_count'  => $unreadCount,
            ];
        }

        usort($data, fn($a, $b) => ($b['last_message']->created_at->timestamp ?? 0) <=> ($a['last_message']->created_at->timestamp ?? 0));
        return response()->json(['data' => $data]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $userId = auth()->id();
        
        // Count unique conversations that have at least one unread message from another user
        $count = Conversation::where(function($q) use ($userId) {
                $q->where('client_id', $userId)->orWhere('freelancer_id', $userId);
            })
            ->whereHas('messages', function($q) use ($userId) {
                $q->where('sender_id', '!=', $userId)->where('is_seen', false);
            })
            ->count();

        return response()->json(['unread_count' => $count]);
    }


    /* ── Messages ───────────────────────────────────────────────────────────── */

    public function getMessages(Request $request, int $conversationId): JsonResponse
    {
        $limit = $request->query('limit', 8);
        $beforeId = $request->query('before_id');

        $query = Message::where('conversation_id', $conversationId);

        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        $messages = $query->orderBy('id', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();

        return response()->json($messages);
    }


    public function sendMessage(Request $request, int $conversationId): JsonResponse
    {
        $validated = $request->validate(['message' => 'required|string']);
        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id'       => auth()->id(),
            'message'         => $validated['message'],
            'is_seen'         => false,
            'is_delivered'    => false,
        ]);

        broadcast(new MessageSent($message))->toOthers();

        // Notify the receiver to update their conversation list
        $conversation = Conversation::find($conversationId);
        $receiverId = ((int)$message->sender_id === (int)$conversation->client_id) ? $conversation->freelancer_id : $conversation->client_id;
        $unreadCount = Message::where('conversation_id', $conversationId)->where('sender_id', '!=', $receiverId)->where('is_seen', false)->count();

        \Illuminate\Support\Facades\Log::info("Triggering ConversationUpdated. Sender: {$message->sender_id}, Receiver: {$receiverId}, Conv: {$conversationId}");

        broadcast(new \App\Events\ConversationUpdated(
            (int)$receiverId,
            (int)$conversationId,
            $message,
            (int)$unreadCount
        ));

        return response()->json(['data' => $message], 201);

    }

    /* ── Status & Presence (API-only, no broadcasting) ───────────────────── */

    public function setGlobalOnline(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->is_online = true;
        $user->last_seen = now('UTC');
        $user->save();

        broadcast(new UserOnlineStatus($user->id, true, $user->last_seen));

        return response()->json(['status' => 'online', 'last_seen' => $user->last_seen]);
    }

    public function setGlobalOffline(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->is_online = false;
        $user->last_seen = now('UTC');
        $user->save();

        broadcast(new UserOnlineStatus($user->id, false, $user->last_seen));

        return response()->json(['status' => 'offline', 'last_seen' => $user->last_seen]);
    }

    public function updateLastSeen(Request $request): JsonResponse
    {
        $user = $request->user();
        $wasOffline = !$user->is_online;
        
        $user->last_seen = now('UTC');
        $user->is_online = true;
        $user->save();

        if ($wasOffline) {
            broadcast(new UserOnlineStatus($user->id, true, $user->last_seen));
        }

        return response()->json(['status' => 'updated', 'last_seen' => $user->last_seen]);
    }

    public function setGlobalOfflineBeacon(Request $request): JsonResponse
    {
        $tokenString = $request->input('_token');
        if (!$tokenString) return response()->json(['status' => 'no_token']);

        $token = PersonalAccessToken::findToken($tokenString);
        if (!$token || !$token->tokenable) return response()->json(['status' => 'invalid_token']);

        $user = $token->tokenable;
        $user->is_online = false;
        $user->last_seen = now('UTC');
        $user->save();

        broadcast(new UserOnlineStatus($user->id, false, $user->last_seen));

        return response()->json(['status' => 'offline']);
    }

    public function markSeen(Request $request, int $conversationId): JsonResponse
    {
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', auth()->id())
            ->where('is_seen', false)
            ->update(['is_seen' => true, 'seen_at' => now('UTC')]);

        broadcast(new MessageSeen($conversationId, auth()->id()))->toOthers();

        return response()->json(['success' => true]);
    }

    public function markDelivered(Request $request, int $conversationId): JsonResponse
    {
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', auth()->id())
            ->where('is_delivered', false)
            ->update(['is_delivered' => true]);

        broadcast(new MessageDelivered($conversationId, auth()->id()))->toOthers();

        return response()->json(['status' => 'delivered']);
    }
}