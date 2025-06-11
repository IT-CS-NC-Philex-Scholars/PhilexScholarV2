<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommunityServiceEntry;
use App\Models\CommunityServiceReport;
use App\Models\ScholarshipApplication;
use App\Notifications\DatabaseNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

final class CommunityServiceController extends Controller
{
    /**
     * Display the community service dashboard with overview statistics.
     */
    public function dashboard(): Response
    {
        // Quick stats for dashboard cards
        $quickStats = [
            'pending_review' => \App\Models\CommunityServiceReport::query()->where('status', 'pending_review')->count(),
            'approved_today' => \App\Models\CommunityServiceReport::query()->where('status', 'approved')
                ->whereDate('reviewed_at', today())->count(),
            'total_hours_this_month' => \App\Models\CommunityServiceReport::query()->where('status', 'approved')
                ->where('reviewed_at', '>=', now()->startOfMonth())->sum('total_hours'),
            'active_sessions' => \App\Models\CommunityServiceEntry::query()->where('status', 'in_progress')->count(),
        ];

        // Recent urgent items (pending > 3 days)
        $urgentReports = CommunityServiceReport::with([
            'scholarshipApplication.studentProfile.user',
            'scholarshipApplication.scholarshipProgram',
        ])
            ->where('status', 'pending_review')
            ->where('submitted_at', '<=', now()->subDays(3))
            ->latest('submitted_at')
            ->limit(5)
            ->get();

        // Performance metrics
        $performanceMetrics = [
            'avg_review_time_hours' => $this->getAverageReviewTime(),
            'approval_rate' => $this->getApprovalRate(),
            'monthly_submissions' => $this->getMonthlySubmissions(),
        ];

        return Inertia::render('Admin/CommunityService/Dashboard', [
            'quickStats' => $quickStats,
            'urgentReports' => $urgentReports,
            'performanceMetrics' => $performanceMetrics,
        ]);
    }

    /**
     * Display a listing of community service submissions for admin review.
     */
    public function index(Request $request): Response
    {
        $query = CommunityServiceReport::with([
            'scholarshipApplication.studentProfile.user',
            'scholarshipApplication.scholarshipProgram',
        ])->whereHas('scholarshipApplication', function ($q) {
            $q->whereHas('studentProfile.user')->whereHas('scholarshipProgram');
        });

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'rejected') {
                $query->where(function ($q): void {
                    $q->where('status', 'like', 'rejected_%');
                });
            } else {
                $query->where('status', $request->status);
            }
        }

        // Filter by report type
        if ($request->filled('report_type')) {
            $query->where('report_type', $request->report_type);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('submitted_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('submitted_at', '<=', $request->date_to.' 23:59:59');
        }

        // Filter by scholarship program
        if ($request->filled('scholarship_program')) {
            $query->whereHas('scholarshipApplication.scholarshipProgram', function ($q) use ($request): void {
                $q->where('id', $request->scholarship_program);
            });
        }

        // Search by student name or scholarship
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function (Builder $q) use ($search) {
                $q->whereHas('scholarshipApplication.studentProfile.user', function (Builder $subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('scholarshipApplication.scholarshipProgram', function (Builder $subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Sort order
        $sortBy = $request->get('sort', 'submitted_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $reports = $query->paginate(20)->withQueryString();

        // Enhanced statistics with trends
        $stats = [
            'pending_review' => \App\Models\CommunityServiceReport::query()->where('status', 'pending_review')->count(),
            'approved' => \App\Models\CommunityServiceReport::query()->where('status', 'approved')->count(),
            'rejected' => \App\Models\CommunityServiceReport::query()->whereIn('status', [
                'rejected_insufficient_hours',
                'rejected_incomplete_documentation',
                'rejected_other',
            ])->count(),
            'total' => \App\Models\CommunityServiceReport::query()->count(),
            'total_hours_approved' => \App\Models\CommunityServiceReport::query()->where('status', 'approved')->sum('total_hours'),
            'total_days_approved' => \App\Models\CommunityServiceReport::query()->where('status', 'approved')->sum('days_completed'),
            'this_week' => \App\Models\CommunityServiceReport::query()->where('submitted_at', '>=', now()->startOfWeek())->count(),
            'this_month' => \App\Models\CommunityServiceReport::query()->where('submitted_at', '>=', now()->startOfMonth())->count(),
            'avg_processing_time' => $this->getAverageReviewTime(),
        ];

        // Recent activity (last 24 hours)
        $recentActivity = CommunityServiceReport::with([
            'scholarshipApplication.studentProfile.user',
            'scholarshipApplication.scholarshipProgram',
        ])
            ->where('submitted_at', '>=', now()->subDay())
            ->latest('submitted_at')
            ->limit(10)
            ->get();

        // Scholarship programs for filter dropdown
        $scholarshipPrograms = \App\Models\ScholarshipProgram::query()->select('id', 'name')
            ->whereIn('id', function ($query): void {
                $query->select('scholarship_program_id')
                    ->from('scholarship_applications')
                    ->whereIn('id', function ($subQuery): void {
                        $subQuery->select('scholarship_application_id')
                            ->from('community_service_reports')
                            ->distinct();
                    });
            })
            ->orderBy('name')
            ->get();
            // dd($reports->first());
        return Inertia::render('Admin/CommunityService/Index', [
            'reports' => $reports,
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'scholarshipPrograms' => $scholarshipPrograms,
            'filters' => $request->only(['status', 'report_type', 'search', 'date_from', 'date_to', 'scholarship_program', 'sort', 'direction']),
        ]);
    }

    /**
     * Display detailed view of a community service report for admin review.
     */
    public function show(CommunityServiceReport $report): Response
    {
        $report->load([
            'scholarshipApplication.studentProfile.user',
            'scholarshipApplication.scholarshipProgram',
            'scholarshipApplication.communityServiceEntries' => function ($query): void {
                $query->orderBy('service_date', 'desc')->orderBy('time_in', 'desc');
            },
        ]);

        $entries = [];
        $reportData = $report->toArray();

        if ($report->scholarshipApplication) {
            $scholarshipApplicationData = $report->scholarshipApplication->toArray();

            if ($report->scholarshipApplication->relationLoaded('studentProfile') && $report->scholarshipApplication->studentProfile) {
                $scholarshipApplicationData['studentProfile'] = $report->scholarshipApplication->studentProfile->toArray();

                if ($report->scholarshipApplication->studentProfile->relationLoaded('user') && $report->scholarshipApplication->studentProfile->user) {
                    $scholarshipApplicationData['studentProfile']['user'] = $report->scholarshipApplication->studentProfile->user->toArray();
                }
            } else {
                $scholarshipApplicationData['studentProfile'] = null;
            }

            if ($report->scholarshipApplication->relationLoaded('scholarshipProgram') && $report->scholarshipApplication->scholarshipProgram) {
                $scholarshipApplicationData['scholarshipProgram'] = $report->scholarshipApplication->scholarshipProgram->toArray();
            } else {
                $scholarshipApplicationData['scholarshipProgram'] = null;
            }

            $reportData['scholarshipApplication'] = $scholarshipApplicationData;

            if ($report->scholarshipApplication->relationLoaded('communityServiceEntries')) {
                $entries = $report->scholarshipApplication->communityServiceEntries
                    ? $report->scholarshipApplication->communityServiceEntries->toArray()
                    : [];
            }

        } else {
            $reportData['scholarshipApplication'] = null;
        }

        return Inertia::render('Admin/CommunityService/Show', [
            'report' => $reportData,
            'entries' => $entries,
        ]);
    }

    /**
     * Display community service entries index for admin review.
     */
    public function entries(Request $request): Response
    {
        $query = CommunityServiceEntry::with([
            'scholarshipApplication.studentProfile.user',
            'scholarshipApplication.scholarshipProgram',
        ]);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by student name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('scholarshipApplication.studentProfile.user', function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $entries = $query->latest('service_date')->paginate(15);

        // Get entry statistics
        $entryStats = [
            'in_progress' => \App\Models\CommunityServiceEntry::query()->where('status', 'in_progress')->count(),
            'completed' => \App\Models\CommunityServiceEntry::query()->where('status', 'completed')->count(),
            'approved' => \App\Models\CommunityServiceEntry::query()->where('status', 'approved')->count(),
            'rejected' => \App\Models\CommunityServiceEntry::query()->where('status', 'rejected')->count(),
            'total' => \App\Models\CommunityServiceEntry::query()->count(),
            'total_hours' => \App\Models\CommunityServiceEntry::query()->where('status', 'approved')->sum('hours_completed'),
        ];

        return Inertia::render('Admin/CommunityService/Entries', [
            'entries' => $entries,
            'stats' => $entryStats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Show detailed view of a community service entry.
     */
    public function showEntry(CommunityServiceEntry $entry): Response
    {
        $entry->load([
            'scholarshipApplication.studentProfile.user',
            'scholarshipApplication.scholarshipProgram',
        ]);

        return Inertia::render('Admin/CommunityService/EntryShow', [
            'entry' => $entry,
            'application' => $entry->scholarshipApplication,
        ]);
    }

    /**
     * Update the status of a community service report.
     */
    public function updateReportStatus(Request $request, CommunityServiceReport $report): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected_insufficient_hours,rejected_incomplete_documentation,rejected_other'],
            'rejection_reason' => ['required_if:status,rejected_insufficient_hours,rejected_incomplete_documentation,rejected_other', 'string', 'max:500'],
        ]);

        $oldStatus = $report->status;

        $report->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'reviewed_at' => now(),
        ]);

        // Send notification if status changed
        if ($oldStatus !== $validated['status']) {
            $this->sendReportStatusNotification($report, $validated['status'], $validated['rejection_reason'] ?? null);
        }

        // Update application status based on report approval
        if ($validated['status'] === 'approved') {
            $this->checkAndUpdateApplicationStatus($report->scholarshipApplication);
        }

        $message = $validated['status'] === 'approved'
            ? 'Community service report approved successfully.'
            : 'Community service report rejected.';

        return Redirect::back()->with('success', $message);
    }

    /**
     * Update the status of a community service entry.
     */
    public function updateEntryStatus(Request $request, CommunityServiceEntry $entry): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $oldStatus = $entry->status;

        $entry->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        // Send notification if status changed
        if ($oldStatus !== $validated['status']) {
            $this->sendEntryStatusNotification($entry, $validated['status'], $validated['admin_notes'] ?? null);
        }

        $message = $validated['status'] === 'approved'
            ? 'Community service entry approved successfully.'
            : 'Community service entry rejected.';

        return Redirect::back()->with('success', $message);
    }

    /**
     * Bulk approve/reject multiple reports.
     */
    public function bulkUpdateReports(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'report_ids' => ['required', 'array'],
            'report_ids.*' => ['integer', 'exists:community_service_reports,id'],
            'action' => ['required', 'in:approve,reject'],
            'rejection_reason' => ['required_if:action,reject', 'string', 'max:500'],
        ]);

        $status = $validated['action'] === 'approve' ? 'approved' : 'rejected_other';

        // Get reports before updating to send notifications
        $reports = \App\Models\CommunityServiceReport::query()->whereIn('id', $validated['report_ids'])->get();

        \App\Models\CommunityServiceReport::query()->whereIn('id', $validated['report_ids'])
            ->update([
                'status' => $status,
                'rejection_reason' => $validated['rejection_reason'] ?? null,
                'reviewed_at' => now(),
            ]);

        // Send notifications for each updated report
        foreach ($reports as $report) {
            $this->sendReportStatusNotification($report, $status, $validated['rejection_reason'] ?? null);
        }

        // Update application statuses for approved reports
        if ($validated['action'] === 'approve') {
            foreach ($reports as $report) {
                $this->checkAndUpdateApplicationStatus($report->scholarshipApplication);
            }
        }

        $count = count($validated['report_ids']);
        $message = $validated['action'] === 'approve'
            ? "Successfully approved {$count} community service reports."
            : "Successfully rejected {$count} community service reports.";

        return Redirect::back()->with('success', $message);
    }

    /**
     * Download PDF report.
     */
    public function downloadPdf(CommunityServiceReport $report)
    {
        abort_if(! $report->pdf_report_path || ! Storage::disk('local')->exists($report->pdf_report_path), 404);

        return response()->download(Storage::disk('local')->path($report->pdf_report_path),
            "community_service_report_{$report->id}.pdf");
    }

    /**
     * Download photo from service entry.
     */
    public function downloadPhoto(CommunityServiceEntry $entry, string $photoPath)
    {
        // Sanitize photoPath to prevent directory traversal
        $basePath = "user_{$entry->scholarshipApplication->student_profile_id}/community_service_entries/{$entry->id}";
        $fullPath = "{$basePath}/{$photoPath}";

        abort_if(! in_array($fullPath, $entry->photos ?? []) || ! Storage::disk('local')->exists($fullPath), 404);

        return response()->download(Storage::disk('local')->path($fullPath));
    }

    /**
     * Export community service data.
     */
    public function export(Request $request)
    {
        $query = CommunityServiceReport::with([
            'scholarshipApplication.studentProfile.user',
            'scholarshipApplication.scholarshipProgram',
        ]);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('report_type')) {
            $query->where('report_type', $request->report_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('scholarshipApplication.studentProfile.user', function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $reports = $query->latest('submitted_at')->get();

        // Create CSV content
        $csvData = "Student Name,Email,Scholarship Program,Report Type,Days Completed,Total Hours,Status,Submitted At,Reviewed At\n";

        foreach ($reports as $report) {
            $student = $report->scholarshipApplication->studentProfile->user;
            $scholarship = $report->scholarshipApplication->scholarshipProgram;

            $csvData .= sprintf(
                "%s,%s,%s,%s,%d,%.2f,%s,%s,%s\n",
                $student->name,
                $student->email,
                $scholarship->name,
                ucfirst(str_replace('_', ' ', $report->report_type)),
                $report->days_completed,
                $report->total_hours,
                ucfirst(str_replace('_', ' ', $report->status)),
                $report->submitted_at->format('Y-m-d H:i:s'),
                $report->reviewed_at ? $report->reviewed_at->format('Y-m-d H:i:s') : 'Not reviewed'
            );
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="community_service_reports_'.date('Y-m-d').'.csv"');
    }

    /**
     * Delete a community service entry (service session).
     */
    public function destroyEntry(CommunityServiceEntry $entry): RedirectResponse
    {
        // Optionally, you can add authorization here (e.g., Gate::authorize('delete', $entry));
        $entry->delete();

        return Redirect::back()->with('success', 'Community service entry deleted successfully.');
    }

    /**
     * Undo approval of a community service entry (set status back to completed).
     */
    public function undoEntryApproval(CommunityServiceEntry $entry): RedirectResponse
    {
        // Optionally, add authorization here
        $entry->update([
            'status' => 'completed',
            'admin_notes' => null,
        ]);

        return Redirect::back()->with('success', 'Entry approval has been undone.');
    }

    /**
     * Create a community service report on behalf of a student (admin creation).
     */
    public function createReportForStudent(Request $request, ScholarshipApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string', 'max:1000'],
            'total_hours' => ['required', 'numeric', 'min:0', 'max:1000'],
            'days_completed' => ['required', 'integer', 'min:0', 'max:365'],
            'pdf_file' => ['nullable', 'file', 'max:10240', 'mimes:pdf'],
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $reportType = 'tracked'; // Default to tracked
        $pdfPath = null;

        // Handle PDF upload if provided
        if ($request->hasFile('pdf_file')) {
            $file = $validated['pdf_file'];
            $filename = time() . '_' . $file->getClientOriginalName();
            $pdfPath = "community_service_reports/scholarship_{$application->id}/{$filename}";
            
            Storage::disk('local')->putFileAs(
                "community_service_reports/scholarship_{$application->id}",
                $file,
                $filename
            );
            
            $reportType = 'pdf_upload';
        }

        // Create the community service report
        $report = CommunityServiceReport::create([
            'scholarship_application_id' => $application->id,
            'description' => $validated['description'],
            'total_hours' => (float) $validated['total_hours'],
            'days_completed' => (int) $validated['days_completed'],
            'status' => 'approved', // Admin created reports are auto-approved
            'report_type' => $reportType,
            'pdf_report_path' => $pdfPath,
            'submitted_at' => now(),
            'reviewed_at' => now(),
        ]);

        // Add admin notes to application if provided
        if (!empty($validated['admin_notes'])) {
            $currentAdminNotes = $application->admin_notes ?? '';
            $newNote = "Admin created community service report #{$report->id}: {$validated['admin_notes']}";
            $application->update([
                'admin_notes' => $currentAdminNotes ? $currentAdminNotes . "\n\n" . $newNote : $newNote
            ]);
        }

        // Check if community service requirements are now met
        $this->checkAndUpdateApplicationStatus($application);

        return Redirect::back()->with('success', 'Community service report created successfully.');
    }

    /**
     * Create a community service entry on behalf of a student (admin creation).
     */
    public function createEntryForStudent(Request $request, ScholarshipApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'service_date' => ['required', 'date', 'before_or_equal:today'],
            'time_in' => ['required', 'string', 'date_format:H:i'],
            'time_out' => ['required', 'string', 'date_format:H:i', 'after:time_in'],
            'task_description' => ['required', 'string', 'max:1000'],
            'lessons_learned' => ['nullable', 'string', 'max:1000'],
            'hours_completed' => ['required', 'numeric', 'min:0.1', 'max:24'],
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        // Create the community service entry
        $entry = \App\Models\CommunityServiceEntry::create([
            'scholarship_application_id' => $application->id,
            'service_date' => $validated['service_date'],
            'time_in' => $validated['time_in'],
            'time_out' => $validated['time_out'],
            'task_description' => $validated['task_description'],
            'lessons_learned' => $validated['lessons_learned'],
            'hours_completed' => (float) $validated['hours_completed'],
            'status' => 'approved', // Admin created entries are auto-approved
            'admin_notes' => $validated['admin_notes'],
        ]);

        // Add admin notes to application if provided
        if (!empty($validated['admin_notes'])) {
            $currentAdminNotes = $application->admin_notes ?? '';
            $newNote = "Admin created community service entry #{$entry->id}: {$validated['admin_notes']}";
            $application->update([
                'admin_notes' => $currentAdminNotes ? $currentAdminNotes . "\n\n" . $newNote : $newNote
            ]);
        }

        return Redirect::back()->with('success', 'Community service entry created successfully.');
    }

    /**
     * Get the total approved hours for a community service report (from DB).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getApprovedHours(CommunityServiceReport $report)
    {
        $approvedHours = $report->scholarshipApplication
            ? $report->scholarshipApplication->communityServiceEntries()
                ->where('status', 'approved')
                ->sum('hours_completed')
            : 0;

        return response()->json(['approved_hours' => round($approvedHours, 2)]);
    }

    /**
     * Check if all community service requirements are met and update application status.
     */
    private function checkAndUpdateApplicationStatus(ScholarshipApplication $application): void
    {
        $requiredDays = $application->scholarshipProgram->community_service_days;
        $approvedDays = $application->communityServiceReports()
            ->where('status', 'approved')
            ->sum('days_completed');

        if ($approvedDays >= $requiredDays) {
            $application->update(['status' => 'service_completed']);
        }
    }

    /**
     * Calculate approval rate for performance metrics.
     */
    private function getApprovalRate(): float
    {
        $total = \App\Models\CommunityServiceReport::query()->whereNotNull('reviewed_at')
            ->where('reviewed_at', '>=', now()->subMonth())
            ->count();

        if ($total === 0) {
            return 0;
        }

        $approved = \App\Models\CommunityServiceReport::query()->where('status', 'approved')
            ->where('reviewed_at', '>=', now()->subMonth())
            ->count();

        return round(($approved / $total) * 100, 1);
    }

    /**
     * Get monthly submission data for charts.
     */
    private function getMonthlySubmissions(): array
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months[] = [
                'month' => $date->format('M Y'),
                'count' => \App\Models\CommunityServiceReport::query()->whereYear('submitted_at', $date->year)
                    ->whereMonth('submitted_at', $date->month)
                    ->count(),
                'approved' => \App\Models\CommunityServiceReport::query()->where('status', 'approved')
                    ->whereYear('submitted_at', $date->year)
                    ->whereMonth('submitted_at', $date->month)
                    ->count(),
            ];
        }

        return $months;
    }

    /**
     * Calculate average review time in hours (compatible with both MySQL and SQLite).
     */
    private function getAverageReviewTime(): float
    {
        $reports = \App\Models\CommunityServiceReport::query()->whereNotNull('reviewed_at')
            ->where('reviewed_at', '>=', now()->subMonth())
            ->select(['submitted_at', 'reviewed_at'])
            ->get();

        if ($reports->isEmpty()) {
            return 0;
        }

        $totalHours = 0;
        foreach ($reports as $report) {
            $submittedAt = \Carbon\Carbon::parse($report->submitted_at);
            $reviewedAt = \Carbon\Carbon::parse($report->reviewed_at);
            $totalHours += $reviewedAt->diffInHours($submittedAt);
        }

        return round($totalHours / $reports->count(), 1);
    }

    /**
     * Send notification to student when community service report status changes.
     */
    private function sendReportStatusNotification(CommunityServiceReport $report, string $newStatus, ?string $rejectionReason = null): void
    {
        $student = $report->scholarshipApplication->studentProfile->user;

        $statusMessages = [
            'approved' => 'Your community service report has been approved!',
            'rejected_insufficient_hours' => 'Your community service report was rejected - insufficient hours.',
            'rejected_incomplete_documentation' => 'Your community service report was rejected - incomplete documentation.',
            'rejected_other' => 'Your community service report was rejected.',
        ];

        $message = $statusMessages[$newStatus] ?? 'Your community service report status has been updated.';

        if ($rejectionReason !== null && $rejectionReason !== '' && $rejectionReason !== '0') {
            $message .= " Reason: {$rejectionReason}";
        }

        $title = 'Community Service Report Update';

        $notification = new DatabaseNotification(
            title: $title,
            message: $message,
            type: $newStatus === 'approved' ? 'success' : 'error',
            actionUrl: route('student.applications.show', $report->scholarshipApplication->id)
        );

        $student->notify($notification);
    }

    /**
     * Send notification to student when community service entry status changes.
     */
    private function sendEntryStatusNotification(CommunityServiceEntry $entry, string $newStatus, ?string $adminNotes = null): void
    {
        $student = $entry->scholarshipApplication->studentProfile->user;

        $statusMessages = [
            'approved' => 'Your community service entry has been approved!',
            'rejected' => 'Your community service entry was rejected.',
        ];

        $message = $statusMessages[$newStatus] ?? 'Your community service entry status has been updated.';

        if ($adminNotes !== null && $adminNotes !== '' && $adminNotes !== '0') {
            $message .= " Notes: {$adminNotes}";
        }

        $title = 'Community Service Entry Update';

        $notification = new DatabaseNotification(
            title: $title,
            message: $message,
            type: $newStatus === 'approved' ? 'success' : 'error',
            actionUrl: route('student.applications.show', $entry->scholarshipApplication->id)
        );

        $student->notify($notification);
    }
}