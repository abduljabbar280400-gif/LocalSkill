<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id',
        'amount',
        'payment_status',
        'transaction_reference',
        'paid_at',
        'platform_fee',
        'platform_fee_percent',
        'freelancer_earnings',
        'escrow_status',
        'freelancer_payout_status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'freelancer_earnings' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    // Relationship
    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}