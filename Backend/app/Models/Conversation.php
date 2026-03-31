<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'contract_id',
        'client_id',
        'freelancer_id'
    ];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}