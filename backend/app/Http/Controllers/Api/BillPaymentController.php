<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BillPayment;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillPaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BillPayment::with(['customer:id,first_name,last_name,cin', 'agent:id,name'])
            ->when($request->search, fn($q, $s) => $q->where(fn($q2) =>
                $q2->where('reference', 'like', "%$s%")
                   ->orWhere('account_number', 'like', "%$s%")
                   ->orWhere('provider', 'like', "%$s%")
            ))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->bill_type, fn($q, $t) => $q->where('bill_type', $t))
            ->when($request->date_from, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'bill_type' => 'required|in:electricity,water,internet,phone,tax,insurance,other',
            'provider' => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
            'amount' => 'required|numeric|min:1',
            'fee' => 'nullable|numeric|min:0',
            'period' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data) {
            $data['reference'] = BillPayment::generateReference();
            $data['agent_id'] = auth()->id();
            $data['fee'] = $data['fee'] ?? 2.00;
            $data['status'] = 'paid';
            $data['paid_at'] = now();

            $bill = BillPayment::create($data);

            Transaction::create([
                'reference' => Transaction::generateReference(),
                'agent_id' => auth()->id(),
                'customer_id' => $data['customer_id'],
                'type' => 'bill_payment',
                'transactionable_type' => BillPayment::class,
                'transactionable_id' => $bill->id,
                'amount' => $bill->amount,
                'fee' => $bill->fee,
                'status' => 'completed',
                'description' => "Bill payment: {$bill->provider} ({$bill->bill_type})",
            ]);

            ActivityLog::record('create_bill_payment', "Bill payment {$bill->reference} processed", $bill);

            return response()->json($bill->load(['customer:id,first_name,last_name', 'agent:id,name']), 201);
        });
    }

    public function show(BillPayment $billPayment): JsonResponse
    {
        return response()->json($billPayment->load(['customer', 'agent:id,name', 'transaction']));
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => BillPayment::count(),
            'today' => BillPayment::whereDate('created_at', today())->count(),
            'this_month' => BillPayment::whereMonth('created_at', now()->month)->count(),
            'total_amount' => BillPayment::where('status', 'paid')->sum('amount'),
            'by_type' => BillPayment::selectRaw('bill_type, count(*) as count, sum(amount) as total')
                ->groupBy('bill_type')->get(),
        ]);
    }
}
