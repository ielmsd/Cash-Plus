<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'agency_code',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function customers()
    {
        return $this->hasMany(Customer::class, 'agent_id');
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class, 'agent_id');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function appNotifications()
    {
        return $this->hasMany(AppNotification::class);
    }
}
