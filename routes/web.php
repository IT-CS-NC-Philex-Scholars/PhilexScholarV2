<?php

declare(strict_types=1);

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
        } else if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } else {
            // Fallback to default dashboard
            return Inertia::render('dashboard');
        }
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/student.php';
require __DIR__.'/admin.php';
