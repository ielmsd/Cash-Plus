<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::with('agent:id,name')
            ->when($request->search, fn($q, $s) => $q->where(fn($q2) =>
                $q2->where('first_name', 'like', "%$s%")
                   ->orWhere('last_name', 'like', "%$s%")
                   ->orWhere('cin', 'like', "%$s%")
                   ->orWhere('phone', 'like', "%$s%")
            ))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->city, fn($q, $c) => $q->where('city', $c))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'cin' => 'required|string|max:20|unique:customers,cin',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'status' => 'in:active,inactive,blocked',
        ]);

        $data['agent_id'] = auth()->id();
        $customer = Customer::create($data);

        ActivityLog::record('create_customer', "Created customer: {$customer->full_name}", $customer, [], $data);

        return response()->json($customer->load('agent:id,name'), 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        return response()->json($customer->load(['agent:id,name', 'transfers', 'billPayments', 'transactions']));
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $data = $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'cin' => "sometimes|string|max:20|unique:customers,cin,{$customer->id}",
            'phone' => 'sometimes|string|max:20',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'status' => 'in:active,inactive,blocked',
        ]);

        $old = $customer->toArray();
        $customer->update($data);

        ActivityLog::record('update_customer', "Updated customer: {$customer->full_name}", $customer, $old, $data);

        return response()->json($customer->load('agent:id,name'));
    }

    public function destroy(Customer $customer): JsonResponse
    {
        ActivityLog::record('delete_customer', "Deleted customer: {$customer->full_name}", $customer);
        $customer->delete();
        return response()->json(['message' => 'Customer deleted.']);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => Customer::count(),
            'active' => Customer::where('status', 'active')->count(),
            'inactive' => Customer::where('status', 'inactive')->count(),
            'blocked' => Customer::where('status', 'blocked')->count(),
            'this_month' => Customer::whereMonth('created_at', now()->month)->count(),
        ]);
    }
}
