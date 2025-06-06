<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipProgram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

final class ScholarshipController extends Controller
{
    /**
     * Display a listing of scholarship programs.
     */
    public function index(): Response
    {
        $scholarships = \App\Models\ScholarshipProgram::query()->withCount(['scholarshipApplications'])
            ->latest()
            ->get()
            ->map(fn($scholarship) =>
                // Optional: Transform for index page if needed, though not strictly required by the prompt
                // For now, keeping it simple for index.
                $scholarship);

        return Inertia::render('Admin/Scholarship/Index', [
            'scholarships' => $scholarships,
        ]);
    }

    /**
     * Show the form for creating a new scholarship program.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Scholarship/Create');
    }

    /**
     * Store a newly created scholarship program.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'total_budget' => ['required', 'numeric', 'min:0'],
            'per_student_budget' => ['required', 'numeric', 'min:0'],
            'school_type_eligibility' => ['required', 'in:high_school,college,both'],
            'min_gpa' => ['required', 'numeric', 'min:0', 'max:100'], // Assuming GPA is 0-100 scale
            'min_units' => ['nullable', 'numeric', 'min:0'],
            'semester' => ['required', 'string', 'max:255'],
            'academic_year' => ['required', 'string', 'max:255'],
            'application_deadline' => ['required', 'date'],
            'community_service_days' => ['required', 'integer', 'min:0'],
            'active' => ['boolean'],
            'available_slots' => ['required', 'integer', 'min:0'],
            'document_requirements' => ['array'],
            'document_requirements.*.name' => ['required_with:document_requirements', 'string', 'max:255'],
            'document_requirements.*.description' => ['required_with:document_requirements', 'string'],
            'document_requirements.*.is_required' => ['required_with:document_requirements', 'boolean'],
        ]);

        $scholarship = \App\Models\ScholarshipProgram::query()->create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'total_budget' => $validated['total_budget'],
            'per_student_budget' => $validated['per_student_budget'],
            'school_type_eligibility' => $validated['school_type_eligibility'],
            'min_gpa' => $validated['min_gpa'],
            'min_units' => $validated['min_units'],
            'semester' => $validated['semester'],
            'academic_year' => $validated['academic_year'],
            'application_deadline' => $validated['application_deadline'],
            'community_service_days' => $validated['community_service_days'],
            'active' => $validated['active'] ?? true,
            'available_slots' => $validated['available_slots'],
        ]);

        if (isset($validated['document_requirements'])) {
            foreach ($validated['document_requirements'] as $requirement) {
                $scholarship->documentRequirements()->create($requirement);
            }
        }

        return Redirect::route('admin.scholarships.index')
            ->with('success', 'Scholarship program created successfully.');
    }

    /**
     * Display the specified scholarship program.
     */
    public function show(ScholarshipProgram $scholarship): Response
    {
        // Load relationships
        $scholarship->load([
            'documentRequirements',
            'scholarshipApplications.studentProfile.user',
            'scholarshipApplications.documentUploads', // Added for completeness if needed on Show page
            'scholarshipApplications.disbursements',    // Added for completeness
        ]);

        // Transform data to camelCase
        $scholarshipData = $scholarship->toArray();

        if (isset($scholarshipData['document_requirements'])) {
            $scholarshipData['documentRequirements'] = $scholarshipData['document_requirements'];
            unset($scholarshipData['document_requirements']);
        }

        if (isset($scholarshipData['scholarship_applications'])) {
            $scholarshipData['scholarshipApplications'] = array_map(function ($application) {
                if (isset($application['student_profile'])) {
                    $application['studentProfile'] = $application['student_profile'];
                    unset($application['student_profile']);
                    // User within studentProfile should be fine as it's typically an object of attributes
                    // If user itself had snake_case keys needing transformation, do it here.
                }

                if (isset($application['document_uploads'])) {
                    $application['documentUploads'] = $application['document_uploads'];
                    unset($application['document_uploads']);
                }

                if (isset($application['disbursements'])) {
                    unset($application['disbursements']);
                }

                // If ScholarshipProgram is nested under application and needs casing:
                if (isset($application['scholarship_program'])) {
                    $application['scholarshipProgram'] = $application['scholarship_program'];
                    unset($application['scholarship_program']);
                }

                return $application;
            }, $scholarshipData['scholarship_applications']);
            unset($scholarshipData['scholarship_applications']);
        } else {
            $scholarshipData['scholarshipApplications'] = [];
        }

        return Inertia::render('Admin/Scholarship/Show', [
            'scholarship' => $scholarshipData,
        ]);
    }

    /**
     * Show the form for editing the specified scholarship program.
     */
    public function edit(ScholarshipProgram $scholarship): Response
    {
        $scholarship->load('documentRequirements');
        $scholarshipData = $scholarship->toArray();

        if (isset($scholarshipData['document_requirements'])) {
            $scholarshipData['documentRequirements'] = $scholarshipData['document_requirements'];
            unset($scholarshipData['document_requirements']);
        }

        return Inertia::render('Admin/Scholarship/Edit', [
            'scholarship' => $scholarshipData,
        ]);
    }

    /**
     * Update the specified scholarship program.
     */
    public function update(Request $request, ScholarshipProgram $scholarship): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'total_budget' => ['required', 'numeric', 'min:0'],
            'per_student_budget' => ['required', 'numeric', 'min:0'],
            'school_type_eligibility' => ['required', 'in:high_school,college,both'],
            'min_gpa' => ['required', 'numeric', 'min:0', 'max:100'],
            'min_units' => ['nullable', 'numeric', 'min:0'],
            'semester' => ['required', 'string', 'max:255'],
            'academic_year' => ['required', 'string', 'max:255'],
            'application_deadline' => ['required', 'date'],
            'community_service_days' => ['required', 'integer', 'min:0'],
            'active' => ['boolean'],
            'available_slots' => ['required', 'integer', 'min:0'],
            // Document requirements update is handled separately, usually via dedicated endpoints
            // or a more complex update logic if done here. For simplicity, not included in this update.
        ]);

        $scholarship->update($validated);

        return Redirect::route('admin.scholarships.show', $scholarship->id)
            ->with('success', 'Scholarship program updated successfully.');
    }

    /**
     * Remove the specified scholarship program.
     */
    public function destroy(ScholarshipProgram $scholarship): RedirectResponse
    {
        if ($scholarship->scholarshipApplications()->exists()) {
            return Redirect::back()->with('error', 'Cannot delete scholarship program with existing applications.');
        }

        // Manually delete related document requirements
        $scholarship->documentRequirements()->delete();
        $scholarship->delete();

        return Redirect::route('admin.scholarships.index')
            ->with('success', 'Scholarship program deleted successfully.');
    }
}
