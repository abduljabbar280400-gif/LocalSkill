<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function extra($username)
{
    try {
        $client = \App\Models\User::where('username', $username)
            ->where('role', 'client')
            ->firstOrFail();

        // 🟢 Ongoing
        $ongoing = \App\Models\Contract::with([
                'project:id,title',
                'freelancer:id,first_name'
            ])
            ->where('client_id', $client->id)
            ->where('status', 'active')
            ->latest()
            ->get();

        // 💰 Pending Payments
        $pendingPayments = \App\Models\Contract::with([
                'project:id,title',
                'freelancer:id,first_name',
                'payments'
            ])
            ->where('client_id', $client->id)
            ->where('status', 'completed')
            ->where(function ($query) {
                $query
                    // Not fully paid
                    ->where('payment_status', '!=', 'paid')

                    // OR paid but not released
                    ->orWhereHas('payments', function ($q) {
                        $q->where('freelancer_payout_status', 'pending');
                    });
            })
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
