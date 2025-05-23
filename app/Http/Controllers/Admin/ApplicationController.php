<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipApplication;
use App\Models\DocumentUpload;
use App\Models\CommunityServiceReport;
use App\Models\Disbursement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Http\Response as IlluminateResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

final class ApplicationController extends Controller
{
    /**
     * Display a listing of applications.
     */
    public function index(Request $request): InertiaResponse
    {
        $query = ScholarshipApplication::with(['studentProfile.user', 'scholarshipProgram']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('scholarship_id') && $request->scholarship_id !== 'all') {
            $query->where('scholarship_program_id', $request->scholarship_id);
        }

        $applicationsPaginator = $query->latest()->paginate(15)->withQueryString();

        // Transform keys for the paginated collection
        $applicationsPaginator->through(function ($application) {
            return $this->transformApplicationData($application);
        });

        return Inertia::render('Admin/Application/Index', [
            'applications' => $applicationsPaginator,
            'filters' => $request->only(['status', 'scholarship_id']),
        ]);
    }

    /**
     * Display the specified application.
     */
    public function show(ScholarshipApplication $application): InertiaResponse
    {
        $application->load([
            'studentProfile.user',
            'scholarshipProgram.documentRequirements',
            'documentUploads.documentRequirement',
            'communityServiceReports',
            'disbursements',
        ]);

        $transformedApplication = $this->transformApplicationData($application);

        return Inertia::render('Admin/Application/Show', [
            'application' => $transformedApplication,
        ]);
    }

    private function transformApplicationData(ScholarshipApplication $application): array
    {
        $data = $application->toArray();

        if (isset($data['student_profile'])) {
            $data['studentProfile'] = $data['student_profile'];
            unset($data['student_profile']);
        }

        if (isset($data['scholarship_program'])) {
            $data['scholarshipProgram'] = $data['scholarship_program'];
            if (isset($data['scholarshipProgram']['document_requirements'])) {
                $data['scholarshipProgram']['documentRequirements'] = $data['scholarshipProgram']['document_requirements'];
                unset($data['scholarshipProgram']['document_requirements']);
            }
            unset($data['scholarship_program']);
        }

        if (isset($data['document_uploads'])) {
            $data['documentUploads'] = array_map(function ($upload) {
                if (isset($upload['document_requirement'])) {
                    $upload['documentRequirement'] = $upload['document_requirement'];
                    unset($upload['document_requirement']);
                }
                return $upload;
            }, $data['document_uploads']);
            unset($data['document_uploads']);
        } else {
            $data['documentUploads'] = [];
        }

        if (isset($data['community_service_reports'])) {
            $data['communityServiceReports'] = $data['community_service_reports'];
            unset($data['community_service_reports']);
        } else {
            $data['communityServiceReports'] = [];
        }

        return $data;
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

        $application = $document->scholarshipApplication()->first();

        if ($application) {
            $allRequiredDocumentsApproved = true;
            $requiredDocIds = $application->scholarshipProgram->documentRequirements()->where('is_required', true)->pluck('id');

            if ($requiredDocIds->isNotEmpty()) {
                $uploadedRequiredDocs = $application->documentUploads()->whereIn('document_requirement_id', $requiredDocIds)->get();

                if ($uploadedRequiredDocs->count() < $requiredDocIds->count()) {
                    $allRequiredDocumentsApproved = false;
                } else {
                    foreach ($uploadedRequiredDocs as $upload) {
                        if ($upload->status !== 'approved') {
                            $allRequiredDocumentsApproved = false;
                            break;
                        }
                    }
                }
            } else {
                $allRequiredDocumentsApproved = true;
            }

            if ($allRequiredDocumentsApproved && $application->status === 'documents_under_review') {
                $application->update(['status' => 'documents_approved']);
            } elseif (!$allRequiredDocumentsApproved && $application->status === 'documents_under_review' && $document->status !== 'approved' && $document->status !== 'pending_review') {
                 $application->update(['status' => 'documents_pending']);
            }
        }

        return Redirect::back()->with('success', 'Document review submitted successfully.');
    }

    /**
     * Serve a private document for viewing/downloading.
     */
    public function viewDocument(DocumentUpload $documentUpload)
    {
        // Basic authorization: ensure admin is logged in (covered by middleware)
        // Add more specific authorization if an admin should only see certain documents.

        // Assuming $documentUpload->file_path is relative to storage/app/
        // e.g., 'private_uploads/scholarship_1/document.pdf'
        // If using a custom private disk, use Storage::disk('your_disk_name')->...
        if (!Storage::disk('local')->exists($documentUpload->file_path)) {
            abort(404, 'File not found.');
        }

        $filePathOnDisk = Storage::disk('local')->path($documentUpload->file_path);
        $filename = $documentUpload->original_filename ?? basename($documentUpload->file_path);
        $mimeType = Storage::disk('local')->mimeType($documentUpload->file_path);

        // For inline viewing (like in an iframe or new tab for PDFs/images)
        return response()->file($filePathOnDisk, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);

        // To force download for all types:
        // return Storage::disk('local')->download($documentUpload->file_path, $filename);
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

    /**
     * Create a new disbursement for an application.
     */
    public function createDisbursement(Request $request, ScholarshipApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'string'],
            'reference_number' => ['nullable', 'string'],
            'disbursement_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'status' => ['required', 'string'],
        ]);

        $application->disbursements()->create($validated);

        if ($validated['status'] === 'processed' && $application->status === 'disbursement_pending') {
            $application->update(['status' => 'disbursement_processed']);
        }

        return Redirect::back()->with('success', 'Disbursement created successfully.');
    }

    /**
     * Update an existing disbursement.
     */
    public function updateDisbursement(Request $request, Disbursement $disbursement): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'string'],
            'reference_number' => ['nullable', 'string'],
            'disbursement_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'status' => ['required', 'string'],
        ]);

        $disbursement->update($validated);

        $application = $disbursement->scholarshipApplication()->first();
        if ($application && $validated['status'] === 'processed' && $application->status === 'disbursement_pending') {
            $application->update(['status' => 'disbursement_processed']);
        }

        return Redirect::back()->with('success', 'Disbursement updated successfully.');
    }
}
