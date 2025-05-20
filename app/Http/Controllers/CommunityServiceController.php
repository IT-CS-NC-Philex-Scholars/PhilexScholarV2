<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\ScholarshipApplication;
use App\Models\CommunityServiceReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

final class CommunityServiceController extends Controller
{


    /**
     * Display the community service form for a scholarship application.
     */
    public function create(ScholarshipApplication $application): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;
        
        // Authorization check
        if ($profile->id !== $application->student_profile_id) {
            abort(403);
        }
        
        // Check if the application status allows for community service reporting
        if ($application->status !== 'enrolled' && $application->status !== 'service_pending') {
            return Inertia::render('Student/CommunityService/NotEligible', [
                'application' => $application,
                'scholarship' => $application->scholarshipProgram,
            ]);
        }
        
        // Get existing service reports
        $serviceReports = $application->communityServiceReports()->latest()->get();
        $totalDaysCompleted = $serviceReports->sum('days_completed');
        $requiredDays = $application->scholarshipProgram->community_service_days;
        
        return Inertia::render('Student/CommunityService/Create', [
            'application' => $application,
            'scholarship' => $application->scholarshipProgram,
            'serviceReports' => $serviceReports,
            'totalDaysCompleted' => $totalDaysCompleted,
            'requiredDays' => $requiredDays,
            'remainingDays' => max(0, $requiredDays - $totalDaysCompleted),
        ]);
    }

    /**
     * Store a new community service report.
     */
    public function store(Request $request, ScholarshipApplication $application): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;
        
        // Authorization check
        if ($profile->id !== $application->student_profile_id) {
            abort(403);
        }
        
        // Check if the application status allows for community service reporting
        if ($application->status !== 'enrolled' && $application->status !== 'service_pending') {
            return Redirect::back()->with('error', 'This application is not eligible for community service reporting.');
        }
        
        $validated = $request->validate([
            'description' => ['required', 'string', 'min:50'],
            'days_completed' => ['required', 'integer', 'min:1'],
        ]);
        
        // Get existing service reports
        $totalDaysCompleted = $application->communityServiceReports()->sum('days_completed');
        $requiredDays = $application->scholarshipProgram->community_service_days;
        $remainingDays = max(0, $requiredDays - $totalDaysCompleted);
        
        // Make sure the reported days don't exceed the remaining required days
        if ($validated['days_completed'] > $remainingDays) {
            return Redirect::back()->with('error', "You can only report up to {$remainingDays} days.")->withInput();
        }
        
        // Create the report
        $report = CommunityServiceReport::create([
            'scholarship_application_id' => $application->id,
            'description' => $validated['description'],
            'days_completed' => $validated['days_completed'],
            'status' => 'pending_review',
            'submitted_at' => now(),
        ]);
        
        // Update application status
        if ($application->status === 'enrolled') {
            $application->update([
                'status' => 'service_pending',
            ]);
        }
        
        // Check if all service days are now completed
        $newTotalDaysCompleted = $totalDaysCompleted + $validated['days_completed'];
        if ($newTotalDaysCompleted >= $requiredDays) {
            $application->update([
                'status' => 'service_completed',
            ]);
        }
        
        return Redirect::route('student.community-service.create', $application)
            ->with('success', 'Community service report submitted successfully.');
    }

    /**
     * Show a specific community service report.
     */
    public function show(ScholarshipApplication $application, CommunityServiceReport $report): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;
        
        // Authorization check
        if ($profile->id !== $application->student_profile_id || 
            $report->scholarship_application_id !== $application->id) {
            abort(403);
        }
        
        return Inertia::render('Student/CommunityService/Show', [
            'application' => $application,
            'scholarship' => $application->scholarshipProgram,
            'report' => $report,
        ]);
    }
}