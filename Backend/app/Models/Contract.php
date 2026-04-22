<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | Table Name (Optional if plural matches)
    |--------------------------------------------------------------------------
    */
    protected $table = 'contracts';

    /*
    |--------------------------------------------------------------------------
    | Mass Assignable Fields
    |--------------------------------------------------------------------------
    */
    protected $fillable = [
    'project_id',
    'client_id',
    'freelancer_id',
    'proposal_id',
    'agreed_amount',
    'proposal_amount',
    'proposal_duration',
    'project_title',
    'project_description',
    'client_name',
    'freelancer_name',
    'start_date',
    'end_date',
    'status',
    'submission_note',
    'freelancer_accepted',
    'freelancer_accepted_at',
    'submitted_at',
    'contract_number',
    'platform_fee_percent',
    'total_paid',
    'total_platform_fee',
    'total_freelancer_earnings',
    'payment_status',
    'total_contract_fee',
];

    /*
    |--------------------------------------------------------------------------
    | Date Casting
    |--------------------------------------------------------------------------
    */
    protected $casts = [
        'start_date'   => 'date',
        'end_date'     => 'date',
        'accepted_at'  => 'datetime',
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
        'amount'       => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // Contract belongs to a Client
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    // Contract belongs to a Freelancer
    public function freelancer()
    {
        return $this->belongsTo(User::class, 'freelancer_id');
    }

    // Contract belongs to a Project
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Contract belongs to a Proposal
    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helper Methods (Optional but Recommended)
    |--------------------------------------------------------------------------
    */

    public function isPending()
    {
        return $this->contract_status === 'pending';
    }

    public function isActive()
    {
        return $this->contract_status === 'active';
    }

    public function isSubmitted()
    {
        return $this->contract_status === 'submitted';
    }

    public function isCompleted()
    {
        return $this->contract_status === 'completed';
    }
    public static function generateContractNumber()
{
    $year = now()->year;

    $lastContract = self::whereYear('created_at', $year)
        ->orderBy('id', 'desc')
        ->first();

    $nextNumber = 1;

    if ($lastContract && $lastContract->contract_number) {
        $lastSequence = (int) substr($lastContract->contract_number, -5);
        $nextNumber = $lastSequence + 1;
    }

    return 'CNT-' . $year . '-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
}

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

}