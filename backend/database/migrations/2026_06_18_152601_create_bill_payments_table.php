<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bill_payments', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('bill_type', ['electricity', 'water', 'internet', 'phone', 'tax', 'insurance', 'other']);
            $table->string('provider', 100);
            $table->string('account_number', 50);
            $table->decimal('amount', 12, 2);
            $table->decimal('fee', 8, 2)->default(0);
            $table->string('period', 20)->nullable();
            $table->enum('status', ['pending', 'paid', 'failed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['reference', 'status', 'bill_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bill_payments');
    }
};
