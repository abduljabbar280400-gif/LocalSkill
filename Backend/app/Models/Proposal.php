<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Proposal extends Model
{
    protected $fillable = [
        'project_id',
        'freelancer_id',
        'cover_letter',
        'proposed_amount',
        'estimated_duration',
        'attachment_file',
        'attachment_link',
        'status',
    ];

    // 🔗 Relationship to Project
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    // 🔗 Relationship to Freelancer (User)
    public function freelancer()
    {
        return $this->belongsTo(User::class, 'freelancer_id');
    }
    public function contract()
{
    return $this->hasOne(Contract::class);
}
}