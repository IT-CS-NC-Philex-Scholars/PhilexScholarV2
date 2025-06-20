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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request): Response
    {
        $selectedScholarshipId = $request->input('scholarship_id');
        $searchTerm = $request->input('search');

        // Base query for scholarship applications to be filtered
        $applicationsQuery = ScholarshipApplication::query()
            ->when($selectedScholarshipId, fn ($query) => $query->where('scholarship_program_id', $selectedScholarshipId));

        // Note: Some stats like total students or active scholarships are global and not affected by the filter.
        $totalStudents = User::query()->where('role', 'student')->count();
        $activeScholarships = ScholarshipProgram::query()->where('active', true)->count();
        $scholarshipsNearingDeadline = ScholarshipProgram::query()->where('active', true)
            ->where('application_deadline', '>=', Carbon::now())
            ->where('application_deadline', '<=', Carbon::now()->addDays(7))
            ->count();

        // Get application statistics based on filter
        $applicationStats = (clone $applicationsQuery)->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->status => $item->count])
            ->toArray();

        // Get pending applications count based on filter
        $pendingApplications = (clone $applicationsQuery)->whereIn('status', [
            'submitted', 'documents_pending', 'documents_under_review', 'service_pending',
        ])->count();

        // Get recent applications based on filter and search
        $recentApplicationsQuery = (clone $applicationsQuery)->with(['studentProfile.user', 'scholarshipProgram'])
            ->when($searchTerm, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('studentProfile.user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('scholarshipProgram', function ($programQuery) use ($search) {
                        $programQuery->where('name', 'like', "%{$search}%");
                    });
                });
            });

        $recentApplications = $recentApplicationsQuery->latest()->take(5)->get();

        // Application Trends data for the last 7 weeks
        $driver = DB::connection()->getDriverName();

        $applicationTrendsQuery = (clone $applicationsQuery);

        if ($driver === 'sqlite') {
            $applicationTrendsQuery->select(DB::raw("strftime('%Y', created_at) as year, strftime('%W', created_at) as week, count(*) as count"));
        } elseif ($driver === 'pgsql') {
            $applicationTrendsQuery->select(DB::raw('EXTRACT(YEAR FROM created_at) as year, EXTRACT(WEEK FROM created_at) as week, count(*) as count'));
        } else {
            // Assuming MySQL
            $applicationTrendsQuery->select(DB::raw('YEAR(created_at) as year, WEEK(created_at, 1) as week, count(*) as count'));
        }

        $applicationTrends = $applicationTrendsQuery
            ->where('created_at', '>=', Carbon::now()->subWeeks(7)->startOfWeek())
            ->groupBy('year', 'week')
            ->orderBy('year')
            ->orderBy('week')
            ->get()
            ->map(function ($item) {
                return [
                    // Add 1 to week because SQL week can start at 0, but we want to show Week 1, Week 2, etc.
                    'date' => 'Week '.((int) $item->week + 1),
                    'New Applications' => $item->count,
                ];
            });

        // Student demographics for the selected scholarship
        $demographicsQuery = StudentProfile::query();

        if ($selectedScholarshipId) {
            $program = ScholarshipProgram::query()->find($selectedScholarshipId);

            $demographicsQuery->whereHas('scholarshipApplications', fn ($q) => $q->where('scholarship_program_id', $selectedScholarshipId));

            if ($program && in_array($program->school_type_eligibility, ['college', 'high_school'])) {
                $demographicsQuery->where('school_level', $program->school_type_eligibility);
            }
        }

        $studentDemographicsBySchoolName = $demographicsQuery
            ->select('school_name', DB::raw('count(*) as count'))
            ->groupBy('school_name')
            ->orderBy('count', 'desc')
            ->take(10) // Limit to top 10 for better visualization
            ->get()
            ->mapWithKeys(fn ($item) => [$item->school_name ?? 'Unknown' => $item->count])
            ->toArray();

        // Financial Snapshot for the selected scholarship
        $totalBudget = ScholarshipProgram::query()
            ->when($selectedScholarshipId, fn ($query, $id) => $query->where('id', $id))
            ->where('active', true)
            ->sum('total_budget');

        $disbursementsQuery = Disbursement::query()
            ->when($selectedScholarshipId, function ($query) use ($selectedScholarshipId) {
                $query->whereHas('scholarshipApplication', fn ($q) => $q->where('scholarship_program_id', $selectedScholarshipId));
            });

        $totalDisbursedAmount = (clone $disbursementsQuery)->where('status', 'completed')->sum('amount');
        $totalPendingDisbursementAmount = (clone $disbursementsQuery)->where('status', 'pending')->sum('amount');

        // Community Service Reports Pending Review for the selected scholarship
        $pendingCommunityServiceReports = CommunityServiceReport::query()
            ->when($selectedScholarshipId, function ($query) use ($selectedScholarshipId) {
                $query->whereHas('scholarshipApplication', fn ($q) => $q->where('scholarship_program_id', $selectedScholarshipId));
            })
            ->where('status', 'submitted')->count();

        // Most popular programs (unfiltered, as this is a global ranking)
        $popularPrograms = ScholarshipProgram::query()->withCount('scholarshipApplications')
            ->orderByDesc('scholarship_applications_count')
            ->take(3)
            ->get(['id', 'name', 'scholarship_applications_count']);

        // Scholarship programs for the filter dropdown
        $scholarshipPrograms = ScholarshipProgram::query()->where('active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'studentsWithProfiles' => StudentProfile::query()->when($selectedScholarshipId, function ($query) use ($selectedScholarshipId) {
                    $query->whereHas('scholarshipApplications', fn ($q) => $q->where('scholarship_program_id', $selectedScholarshipId));
                })->count(),
                'activeScholarships' => $activeScholarships,
                'pendingApplications' => $pendingApplications,
                'applicationStats' => $applicationStats,
                'scholarshipsNearingDeadline' => $scholarshipsNearingDeadline,
                'studentDemographicsBySchoolName' => $studentDemographicsBySchoolName,
                'totalBudget' => (float) $totalBudget,
                'totalDisbursedAmount' => (float) $totalDisbursedAmount,
                'totalPendingDisbursementAmount' => (float) $totalPendingDisbursementAmount,
                'pendingCommunityServiceReports' => $pendingCommunityServiceReports,
                'popularPrograms' => $popularPrograms,
                'applicationTrends' => $applicationTrends,
            ],
            'recentApplications' => $recentApplications,
            'scholarshipPrograms' => $scholarshipPrograms,
            'filters' => [
                'scholarship_id' => $selectedScholarshipId ? (int) $selectedScholarshipId : null,
                'search' => $searchTerm,
            ],
        ]);
    }
}
