<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillPaymentController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Customers
    Route::get('/customers/stats', [CustomerController::class, 'stats']);
    Route::apiResource('/customers', CustomerController::class);

    // Transfers
    Route::get('/transfers/stats', [TransferController::class, 'stats']);
    Route::patch('/transfers/{transfer}/status', [TransferController::class, 'updateStatus']);
    Route::apiResource('/transfers', TransferController::class)->only(['index', 'store', 'show']);

    // Bill Payments
    Route::get('/bill-payments/stats', [BillPaymentController::class, 'stats']);
    Route::apiResource('/bill-payments', BillPaymentController::class)->only(['index', 'store', 'show']);

    // Transactions
    Route::get('/transactions/summary', [TransactionController::class, 'summary']);
    Route::apiResource('/transactions', TransactionController::class)->only(['index', 'show']);

    // Notifications
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::get('/notifications', [NotificationController::class, 'index']);

    // Activity Logs (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        Route::get('/activity-logs/actions', [ActivityLogController::class, 'actions']);

        // User management (Admin only)
        Route::get('/roles', [UserController::class, 'roles']);
        Route::apiResource('/users', UserController::class);
    });
});
