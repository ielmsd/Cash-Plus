<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Your account is suspended. Contact admin.'], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        ActivityLog::record('login', "User {$user->name} logged in");

        return response()->json([
            'user' => array_merge($user->toArray(), [
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ]),
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load([]);
        return response()->json(array_merge($user->toArray(), [
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]));
    }

    public function logout(Request $request): JsonResponse
    {
        ActivityLog::record('logout', "User {$request->user()->name} logged out");
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'phone' => 'sometimes|string|max:20',
            'current_password' => 'required_with:password|string',
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        if (isset($data['current_password'])) {
            if (! Hash::check($data['current_password'], $user->password)) {
                throw ValidationException::withMessages(['current_password' => ['Incorrect current password.']]);
            }
            unset($data['current_password']);
        }

        $user->update($data);

        return response()->json(['message' => 'Profile updated.', 'user' => $user]);
    }
}
