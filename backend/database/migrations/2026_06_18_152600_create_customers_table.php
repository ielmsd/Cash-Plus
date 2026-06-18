<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('cin', 20)->unique();
            $table->string('phone', 20);
            $table->string('email', 150)->nullable();
            $table->string('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->enum('status', ['active', 'inactive', 'blocked'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['cin', 'phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
