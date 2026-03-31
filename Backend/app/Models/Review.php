<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'contract_id',
        'project_id',
        'client_id',
        'freelancer_id',
        'rating',
        'review_comment'
    ];
}