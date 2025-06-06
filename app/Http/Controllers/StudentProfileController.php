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

        return Inertia::render('Student/Profile/Edit', [
            'profile' => $profile,
            'allSchoolData' => $allSchoolData,
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
        ]);

        $user = Auth::user();

        if ($user->studentProfile) {
            $user->studentProfile->update($validated);
        } else {
            $user->studentProfile()->create($validated);
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

        if ($profile) {
            $applications = $profile->scholarshipApplications()
                ->with(['scholarshipProgram'])
                ->latest()
                ->get();
        }

        return Inertia::render('Student/Dashboard', [
            'hasProfile' => $profile !== null,
            'applications' => $applications,
        ]);
    }
}
