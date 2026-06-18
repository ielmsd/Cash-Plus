<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'customer_id', 'agent_id', 'bill_type', 'provider',
        'account_number', 'amount', 'fee', 'period', 'status', 'notes', 'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public static function generateReference(): string
    {
        return 'BILL-' . strtoupper(uniqid());
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function transaction()
    {
        return $this->morphOne(Transaction::class, 'transactionable');
    }
}
