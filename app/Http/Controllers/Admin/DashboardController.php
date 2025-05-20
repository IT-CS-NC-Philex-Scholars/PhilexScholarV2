<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipProgram;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        // Count total number of students
        $totalStudents = User::where('role', 'student')->count();
        
        // Count students with completed profiles
        $studentsWithProfiles = StudentProfile::count();
        
        // Count active scholarship programs
        $activeScholarships = ScholarshipProgram::where('active', true)->count();
        
        // Get application statistics
        $applicationStats = ScholarshipApplication::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            })
            ->toArray();
        
        // Get pending applications count
        $pendingApplications = ScholarshipApplication::whereIn('status', [
            'submitted', 'documents_pending', 'documents_under_review', 'service_pending'
        ])->count();
        
        // Get recent applications
        $recentApplications = ScholarshipApplication::with(['studentProfile.user', 'scholarshipProgram'])
            ->latest()
            ->take(5)
            ->get();
        
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'studentsWithProfiles' => $studentsWithProfiles,
                'activeScholarships' => $activeScholarships,
                'pendingApplications' => $pendingApplications,
                'applicationStats' => $applicationStats,
            ],
            'recentApplications' => $recentApplications,
        ]);
    }
}