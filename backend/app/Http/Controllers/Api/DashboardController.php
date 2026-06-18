<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillPayment;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $period = $request->period ?? 'month';

        [$from, $to] = match($period) {
            'today' => [today(), today()],
            'week' => [now()->startOfWeek(), now()->endOfWeek()],
            'year' => [now()->startOfYear(), now()->endOfYear()],
            default => [now()->startOfMonth(), now()->endOfMonth()],
        };

        $kpis = [
            'total_customers' => Customer::count(),
            'new_customers' => Customer::whereBetween('created_at', [$from, $to])->count(),
            'total_transfers' => Transfer::count(),
            'transfers_period' => Transfer::whereBetween('created_at', [$from, $to])->count(),
            'transfer_amount_period' => Transfer::where('status', 'completed')
                ->whereBetween('created_at', [$from, $to])->sum('amount'),
            'total_bill_payments' => BillPayment::count(),
            'bills_period' => BillPayment::whereBetween('created_at', [$from, $to])->count(),
            'bill_amount_period' => BillPayment::where('status', 'paid')
                ->whereBetween('created_at', [$from, $to])->sum('amount'),
            'total_revenue' => Transaction::where('status', 'completed')
                ->whereBetween('created_at', [$from, $to])->sum('fee'),
            'active_agents' => User::where('status', 'active')->count(),
        ];

        $monthly_trend = Transaction::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, type, sum(amount) as total, count(*) as count')
            ->whereYear('created_at', now()->year)
            ->groupBy('year', 'month', 'type')
            ->orderBy('month')
            ->get();

        $bill_types = BillPayment::selectRaw('bill_type, count(*) as count, sum(amount) as total')
            ->where('status', 'paid')
            ->groupBy('bill_type')
            ->get();

        $recent_transactions = Transaction::with(['customer:id,first_name,last_name', 'agent:id,name'])
            ->latest()
            ->limit(10)
            ->get();

        $top_agents = User::withCount(['transfers as transfer_count' => fn($q) => $q->where('status', 'completed')])
            ->orderByDesc('transfer_count')
            ->limit(5)
            ->get(['id', 'name', 'email', 'agency_code']);

        return response()->json([
            'kpis' => $kpis,
            'monthly_trend' => $monthly_trend,
            'bill_types' => $bill_types,
            'recent_transactions' => $recent_transactions,
            'top_agents' => $top_agents,
            'period' => $period,
        ]);
    }
}
