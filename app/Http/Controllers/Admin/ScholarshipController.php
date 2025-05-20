<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipProgram;
use App\Models\DocumentRequirement;
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
        $scholarships = ScholarshipProgram::withCount(['scholarshipApplications'])
            ->latest()
            ->get();
            
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
            'min_gpa' => ['required', 'numeric', 'min:0', 'max:100'],
            'min_units' => ['nullable', 'numeric', 'min:0'],
            'semester' => ['required', 'string', 'max:255'],
            'academic_year' => ['required', 'string', 'max:255'],
            'application_deadline' => ['required', 'date'],
            'community_service_days' => ['required', 'integer', 'min:0'],
            'active' => ['boolean'],
            'document_requirements' => ['array'],
            'document_requirements.*.name' => ['required', 'string', 'max:255'],
            'document_requirements.*.description' => ['required', 'string'],
            'document_requirements.*.is_required' => ['required', 'boolean'],
        ]);
        
        // Create the scholarship program
        $scholarship = ScholarshipProgram::create([
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
        ]);
        
        // Create document requirements
        if (isset($validated['document_requirements'])) {
            foreach ($validated['document_requirements'] as $requirement) {
                DocumentRequirement::create([
                    'scholarship_program_id' => $scholarship->id,
                    'name' => $requirement['name'],
                    'description' => $requirement['description'],
                    'is_required' => $requirement['is_required'],
                ]);
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
        $scholarship->load(['documentRequirements', 'scholarshipApplications.studentProfile.user']);
        
        return Inertia::render('Admin/Scholarship/Show', [
            'scholarship' => $scholarship,
        ]);
    }
    
    /**
     * Show the form for editing the specified scholarship program.
     */
    public function edit(ScholarshipProgram $scholarship): Response
    {
        $scholarship->load('documentRequirements');
        
        return Inertia::render('Admin/Scholarship/Edit', [
            'scholarship' => $scholarship,
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
        ]);
        
        $scholarship->update($validated);
        
        return Redirect::route('admin.scholarships.show', $scholarship)
            ->with('success', 'Scholarship program updated successfully.');
    }
    
    /**
     * Remove the specified scholarship program.
     */
    public function destroy(ScholarshipProgram $scholarship): RedirectResponse
    {
        // Check if there are any applications for this scholarship
        if ($scholarship->scholarshipApplications()->exists()) {
            return Redirect::back()->with('error', 'Cannot delete scholarship program with existing applications.');
        }
        
        $scholarship->documentRequirements()->delete();
        $scholarship->delete();
        
        return Redirect::route('admin.scholarships.index')
            ->with('success', 'Scholarship program deleted successfully.');
    }
}