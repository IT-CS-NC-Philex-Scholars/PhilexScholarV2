<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\StudentProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

final class StudentProfileController extends Controller
{
    /**
     * Display the student profile form.
     */
    public function edit(): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;
        $allSchoolData = StudentProfile::select('school_name', 'school_type')->whereNotNull('school_name')->whereNotNull('school_type')->distinct()->get();
        $allCourseData = StudentProfile::select('course')->whereNotNull('course')->distinct()->get();

        return Inertia::render('Student/Profile/Edit', [
            'profile' => $profile,
            'allSchoolData' => $allSchoolData,
            'allCourseData' => $allCourseData,
        ]);
    }

    /**
     * Create or update the student profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'], // Province in the Philippines
            'zip_code' => ['required', 'string', 'max:10'], // Philippines postal code is typically 4 digits
            'phone_number' => ['required', 'string'], // Philippines mobile format
            'school_type' => ['required', 'in:high_school,college'],
            'school_level' => ['required', 'string', 'max:255'],
            'school_name' => ['required', 'string', 'max:255'],
            'course' => ['nullable', 'string', 'max:255'],
        ]);

        $user = Auth::user();

        if ($user->studentProfile) {
            $user->studentProfile->update($validated);
            $wasCreated = false;
        } else {
            $user->studentProfile()->create($validated);
            $wasCreated = true;
        }

        if ($request->boolean('onboarding') || $wasCreated) {
            return Redirect::route('dashboard')->with('success', 'Profile completed! Welcome to your dashboard.');
        }

        return Redirect::route('student.profile.edit')->with('success', 'Profile updated successfully.');
    }

    /**
     * Display the student dashboard.
     */
    public function dashboard(): Response
    {
        $user = Auth::user();
        $profile = $user->studentProfile;

        $applications = [];
        $recommendedScholarships = [];

        if ($profile) {
            $applications = $profile->scholarshipApplications()
                ->with(['scholarshipProgram'])
                ->latest()
                ->get();

            // Fetch recommended scholarships based on profile
            $recommendedScholarships = \App\Models\ScholarshipProgram::where('active', true)
                ->where('application_deadline', '>=', now())
                ->where(function ($query) use ($profile) {
                    $query->where('school_type_eligibility', 'both')
                        ->orWhere('school_type_eligibility', $profile->school_type);
                })
                ->where('min_gpa', '<=', $profile->gpa ?? 4.0) // Default to 4.0 if no GPA to be safe, or 0?
                ->limit(3)
                ->get();
        }

        $allSchoolData = StudentProfile::select('school_name', 'school_type')->whereNotNull('school_name')->whereNotNull('school_type')->distinct()->get();
        $allCourseData = StudentProfile::select('course')->whereNotNull('course')->distinct()->get();

        return Inertia::render('Student/Dashboard', [
            'hasProfile' => $profile !== null,
            'applications' => $applications,
            'recommendedScholarships' => $recommendedScholarships,
            'allSchoolData' => $allSchoolData,
            'allCourseData' => $allCourseData,
        ]);
    }
}
