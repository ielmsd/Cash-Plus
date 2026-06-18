<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AppNotification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles')
            ->when($request->search, fn($q, $s) => $q->where(fn($q2) =>
                $q2->where('name', 'like', "%$s%")
                   ->orWhere('email', 'like', "%$s%")
                   ->orWhere('agency_code', 'like', "%$s%")
            ))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->role, fn($q, $r) => $q->role($r))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'agency_code' => 'nullable|string|max:20',
            'status' => 'in:active,inactive,suspended',
            'role' => 'required|string|exists:roles,name',
        ]);

        $role = $data['role'];
        unset($data['role']);
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);
        $user->assignRole($role);

        AppNotification::create([
            'user_id' => $user->id,
            'title' => 'Welcome to CashFlow Manager',
            'message' => "Hello {$user->name}, your account has been created. Role: {$role}",
            'type' => 'info',
        ]);

        ActivityLog::record('create_user', "Created user: {$user->name} with role {$role}");

        return response()->json($user->load('roles'), 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('roles'));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => "sometimes|email|unique:users,email,{$user->id}",
            'password' => 'sometimes|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'agency_code' => 'nullable|string|max:20',
            'status' => 'in:active,inactive,suspended',
            'role' => 'sometimes|string|exists:roles,name',
        ]);

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
            unset($data['role']);
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        ActivityLog::record('update_user', "Updated user: {$user->name}");

        return response()->json($user->load('roles'));
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account.'], 422);
        }
        ActivityLog::record('delete_user', "Deleted user: {$user->name}");
        $user->delete();
        return response()->json(['message' => 'User deleted.']);
    }

    public function roles(): JsonResponse
    {
        return response()->json(Role::all(['id', 'name']));
    }
}
