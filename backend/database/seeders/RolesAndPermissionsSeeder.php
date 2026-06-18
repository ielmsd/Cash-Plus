<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view_dashboard',
            'manage_customers', 'view_customers', 'create_customers', 'edit_customers', 'delete_customers',
            'manage_transfers', 'view_transfers', 'create_transfers',
            'manage_bills', 'view_bills', 'create_bills',
            'view_transactions',
            'manage_users', 'view_users', 'create_users', 'edit_users', 'delete_users',
            'view_reports', 'export_reports',
            'view_activity_logs',
            'view_notifications',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions(Permission::all());

        $agent = Role::firstOrCreate(['name' => 'agent', 'guard_name' => 'web']);
        $agent->syncPermissions([
            'view_dashboard', 'view_customers', 'create_customers', 'edit_customers',
            'view_transfers', 'create_transfers',
            'view_bills', 'create_bills',
            'view_transactions', 'view_notifications',
        ]);

        $employee = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);
        $employee->syncPermissions([
            'view_dashboard', 'view_customers',
            'view_transfers', 'view_bills',
            'view_transactions', 'view_notifications',
        ]);
    }
}
