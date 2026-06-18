<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->enum('type', ['transfer', 'bill_payment', 'deposit', 'withdrawal', 'other']);
            $table->nullableMorphs('transactionable');
            $table->decimal('amount', 12, 2);
            $table->decimal('fee', 8, 2)->default(0);
            $table->string('currency', 5)->default('MAD');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('completed');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->index(['type', 'status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
