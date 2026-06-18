<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('sender_id')->constrained('customers');
            $table->string('recipient_name', 200);
            $table->string('recipient_phone', 20);
            $table->string('recipient_city', 100)->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('fee', 8, 2)->default(0);
            $table->string('currency', 5)->default('MAD');
            $table->enum('type', ['send', 'receive'])->default('send');
            $table->enum('status', ['pending', 'completed', 'cancelled', 'failed'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['reference', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
