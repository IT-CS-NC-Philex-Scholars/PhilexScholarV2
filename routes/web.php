<?php

declare(strict_types=1);

use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
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

    // Profile routes
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::post('/apply-oauth-avatar', [ProfileController::class, 'applyOAuthAvatar'])->name('apply-oauth-avatar');
        Route::post('/apply-facebook-avatar', [ProfileController::class, 'applyOAuthAvatar'])->name('apply-facebook-avatar'); // Backward compatibility
        Route::post('/update-avatar', [ProfileController::class, 'updateAvatar'])->name('update-avatar');
        Route::post('/update-cover-image', [ProfileController::class, 'updateCoverImage'])->name('update-cover-image');
    });

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

// Development-only quick login routes
if (app()->environment('local', 'development')) {
    Route::prefix('dev')->name('dev.')->group(function () {
        Route::get('/login/admin', function () {
            Auth::loginUsingId(1); // Admin user ID from seeder
            return redirect()->route('dashboard');
        })->name('login.admin');

        Route::get('/login/student', function () {
            Auth::loginUsingId(2); // Student user ID from seeder (John Doe)
            return redirect()->route('dashboard');
        })->name('login.student');

        Route::get('/login/jane', function () {
            Auth::loginUsingId(3); // Jane Smith user ID from seeder
            return redirect()->route('dashboard');
        })->name('login.jane');

        Route::get('/login/bob', function () {
            Auth::loginUsingId(4); // Bob Johnson user ID from seeder
            return redirect()->route('dashboard');
        })->name('login.bob');
    });
}

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/student.php';
require __DIR__.'/admin.php';
