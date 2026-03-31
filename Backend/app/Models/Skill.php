<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $table = 'skills';

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function projects()
{
    return $this->belongsToMany(Project::class, 'project_skills');
}


public function category()
{
    return $this->belongsTo(Category::class);
}
}
