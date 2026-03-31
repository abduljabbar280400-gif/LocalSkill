<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FreelancerProfile extends Model
{
    protected $table = 'freelancer_profiles';

    protected $fillable = [
        'user_id',
        'professional_title',
        'bio',
        'experience_level',
        'primary_category_id',
        'hourly_rate',
        'currency',
        'preferred_work_type',
        'availability_status',
        'max_hours_per_week',
        'city',
        'postcode',
        'latitude',
        'longitude',
        'search_radius_km',
        'profile_visibility',
        'onboarding_completed',

        'average_rating',
        'total_reviews',
        'completed_jobs',
    ];

    protected $casts = [
        'onboarding_completed' => 'boolean',
        'hourly_rate' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function user()
{
    return $this->belongsTo(User::class);
}
public function category()
{
    return $this->belongsTo(Category::class, 'primary_category_id');
}

public function skills()
{
    return $this->hasMany(FreelancerSkill::class, 'freelancer_profile_id');
}
}

