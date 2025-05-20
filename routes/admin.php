<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ScholarshipController;
use App\Http\Controllers\Admin\ApplicationController;
use Illuminate\Support\Facades\Route;

// Admin routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Scholarship management
    Route::resource('scholarships', ScholarshipController::class);
    
    // Application management
    Route::get('/applications', [ApplicationController::class, 'index'])->name('applications.index');
    Route::get('/applications/{application}', [ApplicationController::class, 'show'])->name('applications.show');
    Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus'])->name('applications.status.update');
    Route::patch('/documents/{document}/review', [ApplicationController::class, 'reviewDocument'])->name('documents.review');
    Route::patch('/service-reports/{report}/review', [ApplicationController::class, 'reviewServiceReport'])->name('service-reports.review');
});