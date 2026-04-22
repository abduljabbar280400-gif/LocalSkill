<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments for a contract.
     */
    public function index(Request $request, $username, $contractId)
    {
        $user = $request->user();
        \Log::info("Payment index for user {$user->id} on contract {$contractId}");
        
        try {
            $contract = Contract::with(['payments' => function($query) {
                $query->orderBy('paid_at', 'desc');
            }])->where('client_id', $user->id)
              ->findOrFail($contractId);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Contract not found or unauthorized',
                'debug' => [
                    'user_id' => $user->id,
                    'queried_id' => $contractId,
                    'error' => $e->getMessage()
                ]
            ], 404);
        }

        return response()->json([
            'contract_number' => $contract->contract_number,
            'agreed_amount'   => $contract->agreed_amount,
            'total_paid'      => $contract->total_paid,
            'payment_status'  => $contract->payment_status,
            'payments'        => $contract->payments
        ]);
    }

    /**
     * Store a new payment (Escrow).
     */
    public function store(Request $request, $username, $id)
    {
        $request->validate([
            'amount'                => 'required|numeric|min:1',
            'transaction_reference' => 'required|string|unique:payments,transaction_reference',
        ]);

        $contract = Contract::findOrFail($id);
        $user = $request->user();

        if ($contract->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $amount = $request->amount;
        $remaining = $contract->agreed_amount - $contract->total_paid;

        if ($amount > $remaining) {
            return response()->json(['message' => 'Amount exceeds remaining balance'], 400);
        }

        // Calculate commission (10%)
        $platformFeePercent = $contract->platform_fee_percent ?? 10;
        $platformFee = ($amount * $platformFeePercent) / 100;
        $freelancerEarnings = $amount - $platformFee;

        DB::transaction(function () use ($contract, $amount, $platformFee, $freelancerEarnings, $request) {
            
            Payment::create([
                'contract_id'              => $contract->id,
                'amount'                   => $amount,
                'platform_fee'             => $platformFee,
                'freelancer_earnings'      => $freelancerEarnings,
                'transaction_reference'    => $request->transaction_reference,
                'payment_status'           => 'escrowed',
                'escrow_status'            => 'held',
                'freelancer_payout_status' => 'pending',
                'paid_at'                  => now(),
            ]);

            $contract->total_paid += $amount;
            $contract->total_platform_fee += $platformFee;
            $contract->total_contract_fee += $amount;

            if ($contract->total_paid >= $contract->agreed_amount) {
                $contract->payment_status = 'funded';
            } else {
                $contract->payment_status = 'partial';
            }

            $contract->save();
        });

        return response()->json([
            'message'  => 'Payment successful and held in escrow',
            'contract' => $contract->fresh()
        ]);
    }

    /**
     * Get freelancer earnings summary.
     */
    public function freelancerEarnings(Request $request, $username)
    {
        $user = $request->user();

        $payments = Payment::whereHas('contract', function($q) use ($user) {
            $q->where('freelancer_id', $user->id);
        })->get();

        $totalEarned = $payments->where('freelancer_payout_status', 'released')->sum('freelancer_earnings');
        $pendingEscrow = $payments->where('freelancer_payout_status', 'pending')->sum('freelancer_earnings');

        return response()->json([
            'total_earned'   => $totalEarned,
            'pending_escrow' => $pendingEscrow,
            'recent_payments' => $payments->sortByDesc('paid_at')->values()
        ]);
    }
}
