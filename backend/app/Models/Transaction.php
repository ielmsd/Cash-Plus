<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'agent_id', 'customer_id', 'type', 'transactionable_type',
        'transactionable_id', 'amount', 'fee', 'currency', 'status', 'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
    ];

    public static function generateReference(): string
    {
        return 'TXN-' . strtoupper(uniqid());
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function transactionable()
    {
        return $this->morphTo();
    }
}
