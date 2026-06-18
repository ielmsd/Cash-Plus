<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with(['customer:id,first_name,last_name', 'agent:id,name'])
            ->when($request->search, fn($q, $s) => $q->where(fn($q2) =>
                $q2->where('reference', 'like', "%$s%")
                   ->orWhere('description', 'like', "%$s%")
            ))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->date_from, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->when($request->customer_id, fn($q, $id) => $q->where('customer_id', $id))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function show(Transaction $transaction): JsonResponse
    {
        return response()->json($transaction->load(['customer', 'agent:id,name', 'transactionable']));
    }

    public function summary(Request $request): JsonResponse
    {
        $from = $request->date_from ?? now()->startOfMonth()->toDateString();
        $to = $request->date_to ?? now()->toDateString();

        $stats = Transaction::whereBetween('created_at', [$from, $to])
            ->selectRaw('type, count(*) as count, sum(amount) as total_amount, sum(fee) as total_fee')
            ->groupBy('type')
            ->get();

        $daily = Transaction::whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as date, count(*) as count, sum(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json(['by_type' => $stats, 'daily' => $daily]);
    }
}
