<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipApplication;
use App\Models\DocumentUpload;
use App\Models\CommunityServiceReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

final class ApplicationController extends Controller
{
    /**
     * Display a listing of applications.
     */
    public function index(Request $request): Response
    {
        $query = ScholarshipApplication::with(['studentProfile.user', 'scholarshipProgram']);
        
        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Filter by scholarship if provided
        if ($request->has('scholarship_id') && $request->scholarship_id !== 'all') {
            $query->where('scholarship_program_id', $request->scholarship_id);
        }
        
        $applications = $query->latest()->paginate(15);
        
        return Inertia::render('Admin/Application/Index', [
            'applications' => $applications,
            'filters' => $request->only(['status', 'scholarship_id']),
        ]);
    }
    
    /**
     * Display the specified application.
     */
    public function show(ScholarshipApplication $application): Response
    {
        $application->load([
            'studentProfile.user', 
            'scholarshipProgram.documentRequirements', 
            'documentUploads.documentRequirement',
            'communityServiceReports',
            'disbursements'
        ]);
        
        return Inertia::render('Admin/Application/Show', [
            'application' => $application,
        ]);
    }
    
    /**
     * Update the application status.
     */
    public function updateStatus(Request $request, ScholarshipApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
            'admin_notes' => ['nullable', 'string'],
        ]);
        
        $application->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'],
            'reviewed_at' => now(),
        ]);
        
        return Redirect::back()->with('success', 'Application status updated successfully.');
    }
    
    /**
     * Review a document upload.
     */
    public function reviewDocument(Request $request, DocumentUpload $document): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
            'rejection_reason' => ['nullable', 'required_if:status,rejected_invalid,rejected_incomplete,rejected_incorrect_format,rejected_unreadable,rejected_other', 'string'],
        ]);
        
        $document->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'reviewed_at' => now(),
        ]);
        
        // Check if all documents are approved
        $application = $document->scholarshipApplication;
        $allDocumentsApproved = true;
        
        foreach ($application->documentUploads as $upload) {
            if ($upload->status !== 'approved') {
                $allDocumentsApproved = false;
                break;
            }
        }
        
        if ($allDocumentsApproved && $application->status === 'documents_under_review') {
            $application->update([
                'status' => 'documents_approved',
            ]);
        }
        
        return Redirect::back()->with('success', 'Document review submitted successfully.');
    }
    
    /**
     * Review a community service report.
     */
    public function reviewServiceReport(Request $request, CommunityServiceReport $report): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
            'rejection_reason' => ['nullable', 'required_if:status,rejected_insufficient_hours,rejected_incomplete_documentation,rejected_other', 'string'],
        ]);
        
        $report->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'reviewed_at' => now(),
        ]);
        
        return Redirect::back()->with('success', 'Service report review submitted successfully.');
    }
}