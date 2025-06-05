<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\CommunityServiceEntry;
use App\Models\CommunityServiceReport;
use App\Models\ScholarshipApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

final class CommunityServiceController extends Controller
{
    /**
     * Display the community service dashboard for a scholarship application.
     */
    public function create(ScholarshipApplication $application): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id, 403);

        // Check if the application status allows for community service reporting
        if ($application->status !== 'enrolled' && $application->status !== 'service_pending') {
            return Inertia::render('Student/CommunityService/NotEligible', [
                'application' => $application,
                'scholarship' => $application->scholarshipProgram,
            ]);
        }

        // Get existing service reports and entries
        $serviceReports = $application->communityServiceReports()->latest()->get();
        $serviceEntries = $application->communityServiceEntries()->latest()->get();

        $totalDaysCompleted = $serviceReports->sum('days_completed');
        $totalHoursCompleted = $serviceEntries->sum('hours_completed');
        $requiredDays = $application->scholarshipProgram->community_service_days;
        $requiredHours = $requiredDays * 8; // Assume 8 hours per day

        return Inertia::render('Student/CommunityService/Dashboard', [
            'application' => $application,
            'scholarship' => $application->scholarshipProgram,
            'serviceReports' => $serviceReports,
            'serviceEntries' => $serviceEntries,
            'totalDaysCompleted' => $totalDaysCompleted,
            'totalHoursCompleted' => $totalHoursCompleted,
            'requiredDays' => $requiredDays,
            'requiredHours' => $requiredHours,
            'remainingDays' => max(0, $requiredDays - $totalDaysCompleted),
            'remainingHours' => max(0, $requiredHours - $totalHoursCompleted),
        ]);
    }

    /**
     * Store a new community service report (PDF upload option).
     */
    public function store(Request $request, ScholarshipApplication $application): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id, 403);

        // Check if the application status allows for community service reporting
        if ($application->status !== 'enrolled' && $application->status !== 'service_pending') {
            return Redirect::back()->with('error', 'This application is not eligible for community service reporting.');
        }

        $validated = $request->validate([
            'report_type' => ['required', 'in:tracked,pdf_upload'],
            'description' => ['required_if:report_type,tracked', 'string', 'min:50'],
            'total_hours' => ['required_if:report_type,tracked', 'numeric', 'min:0.5'], // Minimum 0.5 hours
            'service_date' => ['required_if:report_type,tracked', 'date', 'before_or_equal:today'],
            'lessons_learned' => ['nullable', 'string'],
            'pdf_report' => ['required_if:report_type,pdf_upload', 'file', 'mimes:pdf', 'max:10240'],
        ]);

        // Get existing service reports
        $totalDaysCompleted = $application->communityServiceReports()->sum('days_completed');
        $requiredDays = $application->scholarshipProgram->community_service_days;
        $remainingDays = max(0, $requiredDays - $totalDaysCompleted);

        $pdfPath = null;
        if ($validated['report_type'] === 'pdf_upload' && $request->hasFile('pdf_report')) {
            $file = $request->file('pdf_report');
            $filename = time().'_'.$file->getClientOriginalName();
            $pdfPath = $file->storeAs('community-service-reports', $filename, 'local');
        }

        // For tracked reports, calculate days from hours (8 hours = 1 day)
        $daysCompleted = $remainingDays; // Default for PDF uploads
        $totalHours = $remainingDays * 8; // Default for PDF uploads

        if ($validated['report_type'] === 'tracked') {
            $totalHours = $validated['total_hours'];
            $daysCompleted = round($totalHours / 8, 2); // Allow fractional days (e.g., 0.5 for 4 hours)

            // Make sure the calculated days don't exceed the remaining required days
            if ($daysCompleted > $remainingDays) {
                $maxHours = $remainingDays * 8;

                return Redirect::back()->with('error', "You can only report up to {$remainingDays} days ({$maxHours} hours).")->withInput();
            }
        }

        // Create the report with service date included in description for tracked reports
        $description = $validated['description'] ?? 'PDF Report Uploaded';
        if ($validated['report_type'] === 'tracked' && isset($validated['service_date'])) {
            $description = "Service Date: {$validated['service_date']}\n\n".$description;
            if (! empty($validated['lessons_learned'])) {
                $description .= "\n\nLessons Learned: ".$validated['lessons_learned'];
            }
        }

        \App\Models\CommunityServiceReport::query()->create([
            'scholarship_application_id' => $application->id,
            'description' => $description,
            'pdf_report_path' => $pdfPath,
            'report_type' => $validated['report_type'],
            'days_completed' => $daysCompleted,
            'total_hours' => $totalHours,
            'status' => 'pending_review',
            'submitted_at' => now(),
        ]);

        // Update application status
        if ($application->status === 'enrolled') {
            $application->update([
                'status' => 'service_pending',
            ]);
        }

        // Only mark as service_completed if all reports are approved
        $allReportsApproved = $application->communityServiceReports()->where('status', '!=', 'approved')->count() === 0;
        if ($allReportsApproved && $application->communityServiceReports()->count() > 0) {
            $application->update([
                'status' => 'service_completed',
            ]);
        }

        return Redirect::route('student.community-service.create', $application)
            ->with('success', 'Community service report submitted successfully.');
    }

    /**
     * Start a new community service entry (time tracking).
     */
    public function startEntry(Request $request, ScholarshipApplication $application): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id, 403);

        $validated = $request->validate([
            'service_date' => ['required', 'date', 'before_or_equal:today'],
            'time_in' => ['required', 'date_format:H:i'],
            'task_description' => ['required', 'string', 'min:10'],
        ]);

        // Check if there's already an in-progress entry for today
        $existingEntry = $application->communityServiceEntries()
            ->where('service_date', $validated['service_date'])
            ->where('status', 'in_progress')
            ->first();

        if ($existingEntry) {
            return Redirect::back()->with('error', 'You already have an active entry for this date.');
        }

        \App\Models\CommunityServiceEntry::query()->create([
            'scholarship_application_id' => $application->id,
            'service_date' => $validated['service_date'],
            'time_in' => $validated['time_in'],
            'task_description' => $validated['task_description'],
            'status' => 'in_progress',
        ]);

        return Redirect::back()->with('success', 'Service entry started successfully.');
    }

    /**
     * End a community service entry (time tracking).
     */
    public function endEntry(Request $request, ScholarshipApplication $application, CommunityServiceEntry $entry): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id ||
            $entry->scholarship_application_id !== $application->id, 403);

        $validated = $request->validate([
            'time_out' => ['nullable', 'date_format:H:i'], // Make time_out optional
            'lessons_learned' => ['nullable', 'string', 'min:10'],
            'photos' => ['nullable', 'array', 'max:5'],
            'photos.*' => ['image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ]);

        // Use current time if no time_out provided, or use provided time_out
        $timeOut = $validated['time_out'] ?? now()->format('H:i');

        // Simple time calculation using Carbon time parsing
        $timeInCarbon = \Carbon\Carbon::createFromFormat('H:i', $entry->time_in);
        $timeOutCarbon = \Carbon\Carbon::createFromFormat('H:i', $timeOut);

        // Validate that end time is after start time (simple time comparison)
        if ($timeOutCarbon->lte($timeInCarbon)) {
            return Redirect::back()->withErrors([
                'time_out' => "End time ({$timeOut}) must be after start time ({$entry->time_in}).",
            ])->withInput();
        }

        // Calculate difference in minutes and convert to hours with decimals
        // Use absolute value to ensure positive result
        $minutesDiff = abs($timeOutCarbon->diffInMinutes($timeInCarbon, false));
        $hoursCompleted = round($minutesDiff / 60, 2);

        // If using current time and session started today, calculate actual elapsed time
        if (! $validated['time_out']) {
            $serviceDate = \Carbon\Carbon::parse($entry->service_date);
            if ($serviceDate->isToday()) {
                $now = now();
                $actualStartTime = $serviceDate->copy()->setTimeFromTimeString($entry->time_in);
                $actualMinutesDiff = $now->diffInMinutes($actualStartTime);
                $hoursCompleted = round($actualMinutesDiff / 60, 2);
                $timeOut = $now->format('H:i');
            }
        }

        if ($hoursCompleted <= 0) {
            return Redirect::back()->with('error', 'Invalid time calculation. Please try again.');
        }

        // Handle photo uploads
        $photoPaths = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $filename = time().'_'.uniqid().'.'.$photo->getClientOriginalExtension();
                $path = $photo->storeAs('community-service-photos', $filename, 'private');
                $photoPaths[] = $path;
            }
        }

        $entry->update([
            'time_out' => $timeOut, // Use calculated time_out
            'lessons_learned' => $validated['lessons_learned'],
            'photos' => $photoPaths,
            'hours_completed' => $hoursCompleted,
            'status' => 'completed',
        ]);

        return Redirect::back()->with('success', 'Service entry completed successfully.');
    }

    /**
     * Cancel an active community service entry.
     */
    public function cancelEntry(ScholarshipApplication $application, CommunityServiceEntry $entry): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id ||
            $entry->scholarship_application_id !== $application->id, 403);

        // Check if the entry is in progress
        if ($entry->status !== 'in_progress') {
            return Redirect::back()->with('error', 'Only active sessions can be cancelled.');
        }

        // Delete the entry
        $entry->delete();

        return Redirect::back()->with('success', 'Session cancelled successfully.');
    }

    /**
     * Show a specific community service report.
     */
    public function show(ScholarshipApplication $application, CommunityServiceReport $report): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id ||
            $report->scholarship_application_id !== $application->id, 403);

        return Inertia::render('Student/CommunityService/Show', [
            'application' => $application,
            'scholarship' => $application->scholarshipProgram,
            'report' => $report,
        ]);
    }

    /**
     * Show a specific community service entry.
     */
    public function showEntry(ScholarshipApplication $application, CommunityServiceEntry $entry): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id ||
            $entry->scholarship_application_id !== $application->id, 403);

        return Inertia::render('Student/CommunityService/EntryShow', [
            'application' => $application,
            'scholarship' => $application->scholarshipProgram,
            'entry' => $entry,
        ]);
    }

    /**
     * Download PDF report.
     */
    public function downloadPdf(ScholarshipApplication $application, CommunityServiceReport $report)
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id ||
            $report->scholarship_application_id !== $application->id, 403);

        abort_if(! $report->pdf_report_path || ! Storage::disk('private')->exists($report->pdf_report_path), 404);

        return Storage::disk('private')->download($report->pdf_report_path);
    }

    /**
     * Download photo from service entry.
     */
    public function downloadPhoto(ScholarshipApplication $application, CommunityServiceEntry $entry, string $photoPath)
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id ||
            $entry->scholarship_application_id !== $application->id, 403);

        abort_if(! in_array($photoPath, $entry->photos ?? []) || ! Storage::disk('private')->exists($photoPath), 404);

        return Storage::disk('private')->download($photoPath);
    }

    /**
     * Allow student to undo service completion (set status back to service_pending).
     */
    public function undoServiceCompletion(ScholarshipApplication $application): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;
        abort_if($profile->id !== $application->student_profile_id, 403);

        if ($application->status === 'service_completed') {
            $application->update(['status' => 'service_pending']);

            return Redirect::back()->with('success', 'Service completion has been undone. You may continue reporting.');
        }

        return Redirect::back()->with('error', 'Cannot undo service completion unless status is service_completed.');
    }

    /**
     * Allow student to undo (delete) a community service report if not approved.
     */
    public function undoReport(ScholarshipApplication $application, CommunityServiceReport $report): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;
        abort_if($profile->id !== $application->student_profile_id || $report->scholarship_application_id !== $application->id, 403);

        if ($report->status === 'approved') {
            return Redirect::back()->with('error', 'Cannot undo an approved report.');
        }

        $report->delete();

        return Redirect::back()->with('success', 'Report has been undone/deleted.');
    }
}
