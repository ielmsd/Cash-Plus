<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user:id,name,email')
            ->when($request->search, fn($q, $s) => $q->where(fn($q2) =>
                $q2->where('action', 'like', "%$s%")
                   ->orWhere('description', 'like', "%$s%")
            ))
            ->when($request->action, fn($q, $a) => $q->where('action', $a))
            ->when($request->user_id, fn($q, $id) => $q->where('user_id', $id))
            ->when($request->date_from, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->date_to, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->orderByDesc('created_at');

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function actions(): JsonResponse
    {
        return response()->json(
            ActivityLog::distinct()->pluck('action')->sort()->values()
        );
    }
}
