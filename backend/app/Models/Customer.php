<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agent_id', 'first_name', 'last_name', 'cin', 'phone',
        'email', 'address', 'city', 'date_of_birth', 'gender', 'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class, 'sender_id');
    }

    public function billPayments()
    {
        return $this->hasMany(BillPayment::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
