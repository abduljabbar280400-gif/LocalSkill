<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SavedFreelancer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'freelancer_profile_id',
    ];
    public function freelancerProfile()
{
    return $this->belongsTo(FreelancerProfile::class);
}
}