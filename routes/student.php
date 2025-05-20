<?php

declare(strict_types=1);

use App\Http\Controllers\CommunityServiceController;
use App\Http\Controllers\ScholarshipController;
use App\Http\Controllers\StudentProfileController;
use Illuminate\Support\Facades\Route;

// Student routes
Route::middleware(['auth', 'verified', 'student'])->prefix('student')->name('student.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [StudentProfileController::class, 'dashboard'])->name('dashboard');
    
    // Profile routes
    Route::get('/profile', [StudentProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [StudentProfileController::class, 'update'])->name('profile.update');
    
    // Scholarship routes
    Route::get('/scholarships', [ScholarshipController::class, 'index'])->name('scholarships.index');
    Route::get('/scholarships/{scholarshipProgram}', [ScholarshipController::class, 'show'])->name('scholarships.show');
    Route::post('/scholarships/{scholarshipProgram}/apply', [ScholarshipController::class, 'apply'])->name('scholarships.apply');
    
    // Application routes
    Route::get('/applications', [ScholarshipController::class, 'applications'])->name('applications.index');
    Route::get('/applications/{application}', [ScholarshipController::class, 'applicationShow'])->name('applications.show');
    Route::post('/applications/{application}/documents', [ScholarshipController::class, 'uploadDocument'])->name('applications.documents.upload');
    Route::post('/applications/{application}/submit', [ScholarshipController::class, 'submitApplication'])->name('applications.submit');
    
    // Community service routes
    Route::get('/applications/{application}/community-service', [CommunityServiceController::class, 'create'])->name('community-service.create');
    Route::post('/applications/{application}/community-service', [CommunityServiceController::class, 'store'])->name('community-service.store');
    Route::get('/applications/{application}/community-service/{report}', [CommunityServiceController::class, 'show'])->name('community-service.show');
});