<?php

namespace App\Models;
use App\Models\Project;
use Illuminate\Database\Eloquent\Model;

class SavedProject extends Model
{
    protected $fillable = [
        'user_id',
        'project_id',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}