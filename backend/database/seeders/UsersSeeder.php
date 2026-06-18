<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(['email' => 'admin@cashflow.ma'], [
            'name' => 'Admin CashFlow',
            'password' => Hash::make('password'),
            'phone' => '+212600000001',
            'agency_code' => 'HQ-001',
            'status' => 'active',
        ]);
        $admin->assignRole('admin');

        $agent1 = User::firstOrCreate(['email' => 'agent1@cashflow.ma'], [
            'name' => 'Youssef Benali',
            'password' => Hash::make('password'),
            'phone' => '+212600000002',
            'agency_code' => 'CAS-001',
            'status' => 'active',
        ]);
        $agent1->assignRole('agent');

        $agent2 = User::firstOrCreate(['email' => 'agent2@cashflow.ma'], [
            'name' => 'Fatima Zahra Idrissi',
            'password' => Hash::make('password'),
            'phone' => '+212600000003',
            'agency_code' => 'RAB-002',
            'status' => 'active',
        ]);
        $agent2->assignRole('agent');

        $employee = User::firstOrCreate(['email' => 'employee@cashflow.ma'], [
            'name' => 'Karim Mansouri',
            'password' => Hash::make('password'),
            'phone' => '+212600000004',
            'agency_code' => 'CAS-001',
            'status' => 'active',
        ]);
        $employee->assignRole('employee');
    }
}
