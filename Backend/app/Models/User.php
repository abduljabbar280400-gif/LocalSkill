<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes, Notifiable;

    protected $fillable = [
        'public_user_code',
        'title',
        'first_name',
        'last_name',
        'username',
        'email',
        'phone',
        'dob',
        'password',
        'role',
        'is_active',
        'is_suspended',
        'suspended_reason',
        'is_online',
        'last_seen',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active'    => 'boolean',
        'is_suspended' => 'boolean',
        'is_online'    => 'boolean',
        'last_seen'    => 'datetime',
        'deleted_at'   => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function freelancerProfile()
    {
        return $this->hasOne(FreelancerProfile::class, 'user_id');
    }

    public function clientProfile()
    {
        return $this->hasOne(ClientProfile::class);
    }

    public function clientContracts()
    {
        return $this->hasMany(Contract::class, 'client_id');
    }

    public function freelancerContracts()
    {
        return $this->hasMany(Contract::class, 'freelancer_id');
    }
}
