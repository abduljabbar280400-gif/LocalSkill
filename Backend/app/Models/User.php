<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
use App\Models\FreelancerProfile;
use Illuminate\Notifications\Notifiable;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
// class User extends Model
{
    use HasApiTokens,SoftDeletes;
    use Notifiable;

    protected $table = 'users';

    protected $primaryKey = 'id';

    public $timestamps = true;

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
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active'    => 'boolean',
        'is_suspended' => 'boolean',
        'deleted_at'   => 'datetime',
    ];

    public function freelancerProfile()
{
    return $this->hasOne(\App\Models\FreelancerProfile::class, 'user_id');
}
// As Client
public function clientContracts()
{
    return $this->hasMany(Contract::class, 'client_id');
}

// As Freelancer
public function freelancerContracts()
{
    return $this->hasMany(Contract::class, 'freelancer_id');
}
public function clientProfile()
{
    return $this->hasOne(ClientProfile::class);
}


}
