<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FreelancerSkill extends Model
{
    protected $table = 'freelancer_skills';

    protected $fillable = [
        'freelancer_profile_id',
        'skill_id',
        'experience_years',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function skill()
    {
        return $this->belongsTo(Skill::class, 'skill_id');
    }
}

