<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientDashboardController extends Controller
{
    public function index(Request $request, string $username): JsonResponse
    {
        $user = User::where('username', $username)->firstOrFail();

        // Ensure authenticated user matches requested username
        if ($request->user()->id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'message' => 'Welcome Client',
            'user' => [
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    public function extra($username)
{
    try {
        // ✅ Get client
        $client = \App\Models\User::where('username', $username)
            ->where('role', 'client')
            ->firstOrFail();

        // ✅ Ongoing Contracts (ACTIVE)
        $ongoing = \App\Models\Contract::with([
                'project:id,title',
                'freelancer:id,first_name'
            ])
            ->where('client_id', $client->id)
            ->where('status', 'active')
            ->latest()
            ->get();

        // ✅ Pending Payments (COMPLETED but NOT fully paid)
        $pendingPayments = \App\Models\Contract::with([
                'project:id,title',
                'freelancer:id,first_name'
            ])
            ->where('client_id', $client->id)
            ->where('status', 'completed')
            ->where('payment_status', '!=', 'paid')
            ->latest()
            ->get();

        return response()->json([
            'ongoing' => $ongoing,
            'pending_payments' => $pendingPayments
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to load dashboard data',
            'error' => $e->getMessage()
        ], 500);
    }
}
}
