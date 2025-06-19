<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\Admin\CommunityServiceController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ScholarshipController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\UserController;
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
    Route::get('/documents/{documentUpload}/view', [ApplicationController::class, 'viewDocument'])->name('documents.view'); // New route for viewing
    Route::patch('/documents/{document}/review', [ApplicationController::class, 'reviewDocument'])->name('documents.review');
    Route::patch('/service-reports/{report}/review', [ApplicationController::class, 'reviewServiceReport'])->name('service-reports.review');
    Route::post('/applications/{application}/disbursements', [ApplicationController::class, 'createDisbursement'])->name('disbursements.store');
    Route::patch('/disbursements/{disbursement}', [ApplicationController::class, 'updateDisbursement'])->name('disbursements.update');

    // User management
    Route::resource('users', UserController::class);

    // Student management
    Route::get('/students/create', [StudentController::class, 'create'])->name('students.create');
    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::get('/students/{student}', [StudentController::class, 'show'])->name('students.show');

    // Community Service management
    Route::get('/community-service/dashboard', [CommunityServiceController::class, 'dashboard'])->name('community-service.dashboard');
    Route::get('/community-service', [CommunityServiceController::class, 'index'])->name('community-service.index');
    Route::get('/community-service/{report}', [CommunityServiceController::class, 'show'])->name('community-service.show');
    Route::get('/community-service/entries', [CommunityServiceController::class, 'entries'])->name('community-service.entries');
    Route::get('/community-service/entries/{entry}', [CommunityServiceController::class, 'showEntry'])->name('community-service.entries.show');

    // Community Service actions
    Route::patch('/community-service/{report}/status', [CommunityServiceController::class, 'updateReportStatus'])->name('community-service.update-status');
    Route::patch('/community-service/entries/{entry}/status', [CommunityServiceController::class, 'updateEntryStatus'])->name('community-service.entries.update-status');
    Route::post('/community-service/bulk-update', [CommunityServiceController::class, 'bulkUpdateReports'])->name('community-service.bulk-update');

    // Community Service downloads
    Route::get('/community-service/{report}/download-pdf', [CommunityServiceController::class, 'downloadPdf'])->name('community-service.download-pdf');
    Route::get('/community-service/entries/{entry}/photos/{photoPath}', [CommunityServiceController::class, 'downloadPhoto'])->name('community-service.download-photo');
    Route::get('/community-service/reports/{report}/download-pdf', [CommunityServiceController::class, 'downloadPdf'])->name('community-service.reports.download-pdf');

    // Export
    Route::get('/community-service/export', [CommunityServiceController::class, 'export'])->name('community-service.export');

    // Community Service entry deletion
    Route::delete('/community-service/entries/{entry}', [CommunityServiceController::class, 'destroyEntry'])->name('community-service.entries.destroy');

    // Community Service entry undo approval
    Route::patch('/community-service/entries/{entry}/undo-approval', [CommunityServiceController::class, 'undoEntryApproval'])->name('community-service.entries.undo-approval');

    // Community Service approved hours
    Route::get('/community-service/{report}/approved-hours', [CommunityServiceController::class, 'getApprovedHours'])->name('community-service.reports.approved-hours');
});
