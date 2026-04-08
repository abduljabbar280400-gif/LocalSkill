<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedFreelancer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'freelancer_profile_id',
    ];
}