<?php

declare(strict_types=1);

use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = Auth::user();

        if ($user->role === 'student') {
            return redirect()->route('student.dashboard');
        }
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        // Fallback to default dashboard
        return Inertia::render('dashboard');

    })->name('dashboard');

    // Notification routes
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('markAsRead');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('markAllAsRead');
        Route::delete('/{id}', [NotificationController::class, 'delete'])->name('delete');
        Route::delete('/', [NotificationController::class, 'deleteAll'])->name('deleteAll');
    });

    // Test routes
    Route::get('/test-notifications', function () {
        return Inertia::render('test-notifications');
    })->name('test-notifications');

    Route::post('/test-notification', function () {
        $user = Auth::user();
        $user->notify(new App\Notifications\DatabaseNotification(
            request('title', 'Test Notification'),
            request('message', 'This is a test'),
            request('type', 'info')
        ));

        return back()->with('success', 'Test notification sent!');
    })->name('test-notification');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/student.php';
require __DIR__.'/admin.php';
