<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommunityServiceReport;
use App\Models\Disbursement;
use App\Models\DocumentUpload;
use App\Models\ScholarshipApplication;
use App\Notifications\DatabaseNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
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
        $applicationsPaginator->through(fn($application): array => $this->transformApplicationData($application));

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

    /**
     * Update the application status.
     */
    public function updateStatus(Request $request, ScholarshipApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $oldStatus = $application->status;

        $application->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'],
            'reviewed_at' => now(),
        ]);

        // Send notification to student if status changed
        if ($oldStatus !== $validated['status']) {
            $this->sendApplicationStatusNotification($application, $validated['status']);
        }

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

        $oldStatus = $document->status;

        $document->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'reviewed_at' => now(),
        ]);

        $application = $document->scholarshipApplication()->first();

        // Send notification to student if document status changed
        if ($oldStatus !== $validated['status'] && $application) {
            $this->sendDocumentStatusNotification($application, $document, $validated['status']);
        }

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

            $oldApplicationStatus = $application->status;

            if ($allRequiredDocumentsApproved && $application->status === 'documents_under_review') {
                $application->update(['status' => 'documents_approved']);
                // Send notification for application status change
                $this->sendApplicationStatusNotification($application, 'documents_approved');
            } elseif (! $allRequiredDocumentsApproved && $application->status === 'documents_under_review' && $document->status !== 'approved' && $document->status !== 'pending_review') {
                $application->update(['status' => 'documents_pending']);
                // Send notification for application status change
                $this->sendApplicationStatusNotification($application, 'documents_pending');
            }
        }

        return Redirect::back()->with('success', 'Document review submitted successfully.');
    }

    /**
     * Upload a document on behalf of a student (admin upload).
     */
    public function uploadForStudent(Request $request, ScholarshipApplication $application, $requirementId): RedirectResponse
    {
        $validated = $request->validate([
            'document_file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx'],
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        // Find the document requirement
        $documentRequirement = $application->scholarshipProgram->documentRequirements()->findOrFail($requirementId);

        // Store the file
        $file = $validated['document_file'];
        $filename = time() . '_' . $file->getClientOriginalName();
        $filePath = "private_uploads/scholarship_{$application->id}/{$filename}";
        
        Storage::disk('local')->putFileAs(
            "private_uploads/scholarship_{$application->id}",
            $file,
            $filename
        );

        // Check if there's already an upload for this requirement and replace it
        $existingUpload = $application->documentUploads()
            ->where('document_requirement_id', $documentRequirement->id)
            ->first();

        if ($existingUpload) {
            // Delete old file if it exists
            if (Storage::disk('local')->exists($existingUpload->file_path)) {
                Storage::disk('local')->delete($existingUpload->file_path);
            }
            
            // Update existing upload
            $existingUpload->update([
                'file_path' => $filePath,
                'original_filename' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'approved', // Admin uploaded documents are auto-approved
                'uploaded_at' => now(),
                'reviewed_at' => now(),
                'rejection_reason' => null,
            ]);
            
            $documentUpload = $existingUpload;
        } else {
            // Create new document upload
            $documentUpload = DocumentUpload::create([
                'scholarship_application_id' => $application->id,
                'document_requirement_id' => $documentRequirement->id,
                'file_path' => $filePath,
                'original_filename' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'approved', // Admin uploaded documents are auto-approved
                'uploaded_at' => now(),
                'reviewed_at' => now(),
            ]);
        }

        // Create an admin note if provided
        if (!empty($validated['admin_notes'])) {
            // You could add this to the document upload or application admin notes
            $currentAdminNotes = $application->admin_notes ?? '';
            $newNote = "Admin uploaded {$documentRequirement->name}: {$validated['admin_notes']}";
            $application->update([
                'admin_notes' => $currentAdminNotes ? $currentAdminNotes . "\n\n" . $newNote : $newNote
            ]);
        }

        // Check if all required documents are now uploaded and approved
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
        }

        if ($allRequiredDocumentsApproved && $application->status === 'documents_pending') {
            $application->update(['status' => 'documents_approved']);
            $this->sendApplicationStatusNotification($application, 'documents_approved');
        }

        return Redirect::back()->with('success', 'Document uploaded successfully on behalf of student.');
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
        abort_unless(Storage::disk('local')->exists($documentUpload->file_path), 404, 'File not found.');

        $filePathOnDisk = Storage::disk('local')->path($documentUpload->file_path);
        $filename = $documentUpload->original_filename ?? basename($documentUpload->file_path);
        $mimeType = $documentUpload->mime_type ?? 'application/octet-stream';

        // For inline viewing (like in an iframe or new tab for PDFs/images)
        return response()->file($filePathOnDisk, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
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
            $data['communityServiceReports'] = array_map(function (array $report) {
                // If tracked, load entries
                if ($report['report_type'] === 'tracked') {
                    $entries = \App\Models\CommunityServiceEntry::query()->where('scholarship_application_id', $report['scholarship_application_id'])
                        ->orderBy('service_date', 'desc')
                        ->orderBy('time_in', 'desc')
                        ->get();
                    $report['entries'] = $entries->toArray();
                } else {
                    $report['entries'] = [];
                }

                return $report;
            }, $data['community_service_reports']);
            unset($data['community_service_reports']);
        } else {
            $data['communityServiceReports'] = [];
        }

        return $data;
    }

    /**
     * Send notification to student when application status changes.
     */
    private function sendApplicationStatusNotification(ScholarshipApplication $application, string $newStatus): void
    {
        $student = $application->studentProfile->user;

        $statusMessages = [
            'pending' => 'Your scholarship application is now pending review.',
            'documents_under_review' => 'Your documents are now under review.',
            'documents_approved' => 'Your documents have been approved!',
            'documents_pending' => 'Some of your documents need attention.',
            'approved' => 'Congratulations! Your scholarship application has been approved!',
            'rejected' => 'Unfortunately, your scholarship application has been rejected.',
            'disbursement_pending' => 'Your scholarship is approved and disbursement is pending.',
            'disbursement_processed' => 'Your scholarship funds have been processed!',
            'cancelled' => 'Your scholarship application has been cancelled.',
        ];

        $message = $statusMessages[$newStatus] ?? 'Your application status has been updated.';
        $title = 'Application Status Update';

        $notification = new DatabaseNotification(
            title: $title,
            message: $message,
            type: in_array($newStatus, ['approved', 'documents_approved', 'disbursement_processed']) ? 'success' :
                  (in_array($newStatus, ['rejected', 'cancelled']) ? 'error' : 'info'),
            actionUrl: route('student.applications.show', $application->id)
        );

        $student->notify($notification);
    }

    /**
     * Send notification to student when document status changes.
     */
    private function sendDocumentStatusNotification(ScholarshipApplication $application, DocumentUpload $document, string $newStatus): void
    {
        $student = $application->studentProfile->user;

        $documentName = $document->documentRequirement->name ?? 'Document';

        $statusMessages = [
            'approved' => "Your {$documentName} has been approved!",
            'rejected_invalid' => "Your {$documentName} was rejected - invalid document.",
            'rejected_incomplete' => "Your {$documentName} was rejected - incomplete information.",
            'rejected_incorrect_format' => "Your {$documentName} was rejected - incorrect format.",
            'rejected_unreadable' => "Your {$documentName} was rejected - document is unreadable.",
            'rejected_other' => "Your {$documentName} was rejected.",
            'pending_review' => "Your {$documentName} is now under review.",
        ];

        $message = $statusMessages[$newStatus] ?? "Your {$documentName} status has been updated.";

        if ($document->rejection_reason) {
            $message .= " Reason: {$document->rejection_reason}";
        }

        $title = 'Document Review Update';

        $notification = new DatabaseNotification(
            title: $title,
            message: $message,
            type: $newStatus === 'approved' ? 'success' :
                  (str_starts_with($newStatus, 'rejected') ? 'error' : 'info'),
            actionUrl: route('student.applications.show', $application->id)
        );

        $student->notify($notification);
    }
}
