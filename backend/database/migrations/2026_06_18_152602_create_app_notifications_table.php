<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('message');
            $table->string('type', 50)->default('info');
            $table->string('icon', 50)->nullable();
            $table->string('link', 200)->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
    }
};
