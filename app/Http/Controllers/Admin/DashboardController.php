<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommunityServiceReport;
use App\Models\Disbursement;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipProgram;
use App\Models\StudentProfile;
use App\Models\User;
use Carbon\Carbon;
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
        $totalStudents = \App\Models\User::query()->where('role', 'student')->count();

        // Count students with completed profiles
        $studentsWithProfiles = \App\Models\StudentProfile::query()->count();

        // Count active scholarship programs
        $activeScholarships = \App\Models\ScholarshipProgram::query()->where('active', true)->count();

        // Get application statistics
        $applicationStats = \App\Models\ScholarshipApplication::query()->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->status => $item->count])
            ->toArray();

        // Get pending applications count
        $pendingApplications = \App\Models\ScholarshipApplication::query()->whereIn('status', [
            'submitted', 'documents_pending', 'documents_under_review', 'service_pending',
        ])->count();

        // Get recent applications
        $recentApplications = ScholarshipApplication::with(['studentProfile.user', 'scholarshipProgram'])
            ->latest()
            ->take(5)
            ->get();

        // Scholarships nearing deadline (e.g., within the next 7 days)
        $scholarshipsNearingDeadline = \App\Models\ScholarshipProgram::query()->where('active', true)
            ->where('application_deadline', '>=', Carbon::now())
            ->where('application_deadline', '<=', Carbon::now()->addDays(7))
            ->count();

        // Student demographics by school type
        $studentDemographicsBySchoolType = \App\Models\StudentProfile::query()->select('school_type', DB::raw('count(*) as count'))
            ->groupBy('school_type')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->school_type ?? 'Unknown' => $item->count])
            ->toArray();

        // Financial Snapshot
        $totalDisbursedAmount = \App\Models\Disbursement::query()->where('status', 'completed')->sum('amount');
        $totalPendingDisbursementAmount = \App\Models\Disbursement::query()->where('status', 'pending')->sum('amount'); // Assuming 'pending' is a status

        // Community Service Reports Pending Review
        $pendingCommunityServiceReports = \App\Models\CommunityServiceReport::query()->where('status', 'submitted')->count(); // Assuming 'submitted' means pending review

        // Most popular programs (top 3 by application count)
        $popularPrograms = \App\Models\ScholarshipProgram::query()->withCount('scholarshipApplications')
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
