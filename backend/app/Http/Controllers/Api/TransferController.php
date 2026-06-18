<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Transaction;
use App\Models\Transfer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransferController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transfer::with(['sender:id,first_name,last_name,cin', 'agent:id,name'])
            ->when($request->search, fn($q, $s) => $q->where(fn($q2) =>
                $q2->where('reference', 'like', "%$s%")
                   ->orWhere('recipient_name', 'like', "%$s%")
                   ->orWhere('recipient_phone', 'like', "%$s%")
            ))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->date_from, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sender_id' => 'required|exists:customers,id',
            'recipient_name' => 'required|string|max:200',
            'recipient_phone' => 'required|string|max:20',
            'recipient_city' => 'nullable|string|max:100',
            'amount' => 'required|numeric|min:1',
            'fee' => 'nullable|numeric|min:0',
            'type' => 'required|in:send,receive',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data) {
            $data['reference'] = Transfer::generateReference();
            $data['agent_id'] = auth()->id();
            $data['fee'] = $data['fee'] ?? ($data['amount'] * 0.015);
            $data['status'] = 'completed';
            $data['completed_at'] = now();

            $transfer = Transfer::create($data);

            Transaction::create([
                'reference' => Transaction::generateReference(),
                'agent_id' => auth()->id(),
                'customer_id' => $data['sender_id'],
                'type' => 'transfer',
                'transactionable_type' => Transfer::class,
                'transactionable_id' => $transfer->id,
                'amount' => $transfer->amount,
                'fee' => $transfer->fee,
                'status' => 'completed',
                'description' => "Money transfer to {$transfer->recipient_name}",
            ]);

            ActivityLog::record('create_transfer', "Transfer {$transfer->reference} created", $transfer);

            return response()->json($transfer->load(['sender:id,first_name,last_name', 'agent:id,name']), 201);
        });
    }

    public function show(Transfer $transfer): JsonResponse
    {
        return response()->json($transfer->load(['sender', 'agent:id,name', 'transaction']));
    }

    public function updateStatus(Request $request, Transfer $transfer): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,completed,cancelled,failed',
        ]);

        $old = ['status' => $transfer->status];
        $transfer->update([
            'status' => $data['status'],
            'completed_at' => $data['status'] === 'completed' ? now() : $transfer->completed_at,
        ]);

        ActivityLog::record('update_transfer_status', "Transfer {$transfer->reference} status changed to {$data['status']}", $transfer, $old, $data);

        return response()->json($transfer);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => Transfer::count(),
            'today' => Transfer::whereDate('created_at', today())->count(),
            'this_month' => Transfer::whereMonth('created_at', now()->month)->count(),
            'total_amount' => Transfer::where('status', 'completed')->sum('amount'),
            'today_amount' => Transfer::where('status', 'completed')->whereDate('created_at', today())->sum('amount'),
            'by_status' => Transfer::selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
        ]);
    }
}
