<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipProgram;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Disbursement;
use App\Models\CommunityServiceReport;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

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
            ->mapWithKeys(fn ($item) => [$item->status => $item->count])
            ->toArray();

        // Get pending applications count
        $pendingApplications = ScholarshipApplication::whereIn('status', [
            'submitted', 'documents_pending', 'documents_under_review', 'service_pending',
        ])->count();

        // Get recent applications
        $recentApplications = ScholarshipApplication::with(['studentProfile.user', 'scholarshipProgram'])
            ->latest()
            ->take(5)
            ->get();

        // Scholarships nearing deadline (e.g., within the next 7 days)
        $scholarshipsNearingDeadline = ScholarshipProgram::where('active', true)
            ->where('application_deadline', '>=', Carbon::now())
            ->where('application_deadline', '<=', Carbon::now()->addDays(7))
            ->count();

        // Student demographics by school type
        $studentDemographicsBySchoolType = StudentProfile::select('school_type', DB::raw('count(*) as count'))
            ->groupBy('school_type')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->school_type ?? 'Unknown' => $item->count])
            ->toArray();

        // Financial Snapshot
        $totalDisbursedAmount = Disbursement::where('status', 'completed')->sum('amount');
        $totalPendingDisbursementAmount = Disbursement::where('status', 'pending')->sum('amount'); // Assuming 'pending' is a status

        // Community Service Reports Pending Review
        $pendingCommunityServiceReports = CommunityServiceReport::where('status', 'submitted')->count(); // Assuming 'submitted' means pending review

        // Most popular programs (top 3 by application count)
        $popularPrograms = ScholarshipProgram::withCount('scholarshipApplications')
            ->orderByDesc('scholarship_applications_count')
            ->take(3)
            ->get(['id', 'name', 'scholarship_applications_count']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'studentsWithProfiles' => $studentsWithProfiles,
                'activeScholarships' => $activeScholarships,
                'pendingApplications' => $pendingApplications,
                'applicationStats' => $applicationStats,
                'scholarshipsNearingDeadline' => $scholarshipsNearingDeadline,
                'studentDemographicsBySchoolType' => $studentDemographicsBySchoolType,
                'totalDisbursedAmount' => (float) $totalDisbursedAmount,
                'totalPendingDisbursementAmount' => (float) $totalPendingDisbursementAmount,
                'pendingCommunityServiceReports' => $pendingCommunityServiceReports,
                'popularPrograms' => $popularPrograms,
            ],
            'recentApplications' => $recentApplications,
        ]);
    }
}