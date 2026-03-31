<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClientProfile extends Model
{
    use SoftDeletes;

    protected $table = 'client_profiles';

    protected $fillable = [
        'user_id',
        'company_name',
        'company_website',
        'industry',
        'company_size',
        'description',
        'state',
        'city',
        'postcode',
        'latitude',
        'longitude',
        'is_profile_completed',
        'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_profile_completed' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
