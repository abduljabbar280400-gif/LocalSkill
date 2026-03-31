<?php

namespace App\Models;

use App\Models\Proposal;
use App\Models\Contract;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'category_id',
        'budget_min',
        'budget_max',
        'budget_type',
        'experience_level',
        'preferred_work_type',
        'duration',
        'postal_code',
        'location',
        'latitude',
        'longitude',
        'deadline',
        'status',
        'location_type',
    ];

    protected $casts = [
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'latitude'   => 'float',
        'longitude'  => 'float',
        'deadline'   => 'datetime',
    ];

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'project_skills', 'project_id', 'skill_id');
    }
    public function category()
{
    return $this->belongsTo(Category::class);
}
public function user()
{
    return $this->belongsTo(User::class);
}
public function proposals()
{
    return $this->hasMany(Proposal::class, 'project_id');
}
public function contracts()
{
    return $this->hasMany(Contract::class);
}

public function getBudgetRangeAttribute()
    {
        if ($this->budget_min && $this->budget_max) {
            return $this->budget_min . ' - ' . $this->budget_max;
        }

        return null;
    }

    public function getMapLocationAttribute()
    {
        if ($this->latitude && $this->longitude) {
            return [
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
            ];
        }

        return null;
    }
}