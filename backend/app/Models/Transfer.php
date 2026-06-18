<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'agent_id', 'sender_id', 'recipient_name', 'recipient_phone',
        'recipient_city', 'amount', 'fee', 'currency', 'type', 'status', 'notes', 'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    public static function generateReference(): string
    {
        return 'TRF-' . strtoupper(uniqid());
    }

    public function getTotalAttribute(): float
    {
        return (float) $this->amount + (float) $this->fee;
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function sender()
    {
        return $this->belongsTo(Customer::class, 'sender_id');
    }

    public function transaction()
    {
        return $this->morphOne(Transaction::class, 'transactionable');
    }
}
