<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AppNotification::where('user_id', auth()->id())
            ->when(isset($request->is_read), fn($q) => $q->where('is_read', $request->boolean('is_read')))
            ->orderByDesc('created_at');

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function unreadCount(): JsonResponse
    {
        return response()->json([
            'count' => AppNotification::where('user_id', auth()->id())->where('is_read', false)->count(),
        ]);
    }

    public function markAsRead(AppNotification $notification): JsonResponse
    {
        abort_if($notification->user_id !== auth()->id(), 403);
        $notification->markAsRead();
        return response()->json(['message' => 'Marked as read.']);
    }

    public function markAllAsRead(): JsonResponse
    {
        AppNotification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function destroy(AppNotification $notification): JsonResponse
    {
        abort_if($notification->user_id !== auth()->id(), 403);
        $notification->delete();
        return response()->json(['message' => 'Notification deleted.']);
    }
}
