<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\DocumentUpload;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipProgram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

final class ScholarshipController extends Controller
{
    /**
     * Display a listing of available scholarship programs.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Get scholarship programs that match the student's school type or are for both types
        $scholarships = [];
        $existingApplicationIds = [];

        if ($profile) {
            $scholarships = \App\Models\ScholarshipProgram::query()->where('active', true)
                ->where(function ($query) use ($profile): void {
                    $query->where('school_type_eligibility', $profile->school_type)
                        ->orWhere('school_type_eligibility', 'both');
                })
                ->where('application_deadline', '>=', now())
                ->latest()
                ->get();

            // Get the student's existing applications to disable applying twice
            $existingApplicationIds = $profile->scholarshipApplications()
                ->pluck('scholarship_program_id')
                ->toArray();
        } else {
            // If no profile, show all scholarships but require profile completion to apply
            $scholarships = \App\Models\ScholarshipProgram::query()->where('active', true)
                ->where('application_deadline', '>=', now())
                ->latest()
                ->get();
        }

        return Inertia::render('Student/Scholarship/Index', [
            'scholarships' => $scholarships,
            'existingApplicationIds' => $existingApplicationIds,
            'hasProfile' => $profile !== null,
        ]);
    }

    /**
     * Display the specified scholarship program details.
     */
    public function show(ScholarshipProgram $scholarshipProgram): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Check if student has already applied
        $existingApplication = null;

        if ($profile) {
            $existingApplication = $profile->scholarshipApplications()
                ->where('scholarship_program_id', $scholarshipProgram->id)
                ->first();
        }

        // Load document requirements
        $documentRequirements = $scholarshipProgram->documentRequirements;

        return Inertia::render('Student/Scholarship/Show', [
            'scholarship' => $scholarshipProgram,
            'documentRequirements' => $documentRequirements,
            'existingApplication' => $existingApplication,
            'hasProfile' => $profile !== null,
            'canApply' => $profile !== null && $existingApplication === null &&
                         $scholarshipProgram->active &&
                         $scholarshipProgram->application_deadline >= now() &&
                         $scholarshipProgram->getRemainingSlots() > 0 &&
                         ($profile && ($scholarshipProgram->school_type_eligibility === $profile->school_type ||
                          $scholarshipProgram->school_type_eligibility === 'both')),
        ]);
    }

    /**
     * Apply for a scholarship program.
     */
    public function apply(Request $request, ScholarshipProgram $scholarshipProgram): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        if (! $profile) {
            return Redirect::route('student.profile.edit')
                ->with('error', 'You need to complete your profile before applying for scholarships.');
        }

        // Check if student has already applied
        $existingApplication = $profile->scholarshipApplications()
            ->where('scholarship_program_id', $scholarshipProgram->id)
            ->first();

        if ($existingApplication) {
            return Redirect::route('student.applications.show', $existingApplication)
                ->with('info', 'You have already applied for this scholarship.');
        }

        // Check eligibility
        if (! $scholarshipProgram->active ||
            $scholarshipProgram->application_deadline < now() ||
            $scholarshipProgram->getRemainingSlots() <= 0 ||
            ($scholarshipProgram->school_type_eligibility !== $profile->school_type &&
             $scholarshipProgram->school_type_eligibility !== 'both')) {
            return Redirect::route('student.scholarships.index')
                ->with('error', 'You are not eligible for this scholarship or the program is no longer accepting applications.');
        }

        // Create application
        $application = \App\Models\ScholarshipApplication::query()->create([
            'student_profile_id' => $profile->id,
            'scholarship_program_id' => $scholarshipProgram->id,
            'status' => 'draft',
        ]);

        return Redirect::route('student.applications.show', $application)
            ->with('success', 'Application created. Please upload the required documents.');
    }

    /**
     * Show the student's application.
     */
    public function applicationShow(ScholarshipApplication $application): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id, 403);

        $application->load(['scholarshipProgram.documentRequirements', 'documentUploads.documentRequirement']);

        // Group the document uploads by requirement
        $documentUploads = [];
        foreach ($application->scholarshipProgram->documentRequirements as $requirement) {
            $upload = $application->documentUploads
                ->where('document_requirement_id', $requirement->id)
                ->first();

            $documentUploads[] = [
                'requirement' => $requirement,
                'upload' => $upload,
            ];
        }

        return Inertia::render('Student/Application/Show', [
            'application' => $application,
            'scholarship' => $application->scholarshipProgram,
            'documentUploads' => $documentUploads,
            'canSubmit' => $application->status === 'draft' &&
                           $application->documentUploads->count() === $application->scholarshipProgram->documentRequirements->count(),
        ]);
    }

    /**
     * Upload a document for a scholarship application.
     */
    public function uploadDocument(Request $request, ScholarshipApplication $application): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id, 403);

        $validated = $request->validate([
            'document_requirement_id' => ['required', 'exists:document_requirements,id'],
            'document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ]);

        // Check if the document requirement belongs to this scholarship program
        $requirementExists = $application->scholarshipProgram->documentRequirements()
            ->where('id', $validated['document_requirement_id'])
            ->exists();

        if (! $requirementExists) {
            return Redirect::back()->with('error', 'Invalid document requirement.');
        }

        // Check if document already exists and delete it
        $existingUpload = $application->documentUploads()
            ->where('document_requirement_id', $validated['document_requirement_id'])
            ->first();

        if ($existingUpload) {
            Storage::delete($existingUpload->file_path);
            $existingUpload->delete();
        }

        // Store the new document
        $path = $request->file('document')->store('documents/'.$application->id);

        \App\Models\DocumentUpload::query()->create([
            'scholarship_application_id' => $application->id,
            'document_requirement_id' => $validated['document_requirement_id'],
            'file_path' => $path,
            'original_filename' => $request->file('document')->getClientOriginalName(),
            'status' => 'pending_review',
            'uploaded_at' => now(),
        ]);

        return Redirect::route('student.applications.show', $application)
            ->with('success', 'Document uploaded successfully.');
    }

    /**
     * Submit a scholarship application.
     */
    public function submitApplication(ScholarshipApplication $application): RedirectResponse
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        // Authorization check
        abort_if($profile->id !== $application->student_profile_id, 403);

        // Check if all required documents are uploaded
        $requiredDocumentCount = $application->scholarshipProgram->documentRequirements()->count();
        $uploadedDocumentCount = $application->documentUploads()->count();

        if ($uploadedDocumentCount < $requiredDocumentCount) {
            return Redirect::route('student.applications.show', $application)
                ->with('error', 'Please upload all required documents before submitting.');
        }

        // Update application status
        $application->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return Redirect::route('student.applications.show', $application)
            ->with('success', 'Application submitted successfully. It will be reviewed by our team.');
    }

    /**
     * List all applications for the student.
     */
    public function applications(): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        $applications = [];

        if ($profile) {
            $applications = $profile->scholarshipApplications()
                ->with(['scholarshipProgram'])
                ->latest()
                ->get();
        }

        return Inertia::render('Student/Application/Index', [
            'applications' => $applications,
        ]);
    }
}
