<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentProfile;
// ScholarshipApplication is used in the show method, but not directly queried here for index/show student lists
// use App\Models\ScholarshipApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

// No need for LengthAwarePaginator import if we use through()

final class StudentController extends Controller
{
    /**
     * Show the form for creating a new student profile.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Student/Create');
    }

    /**
     * Store a newly created student profile in storage.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        // Prepare GPA input
        $gpaInput = $request->input('gpa');
        if ($gpaInput && is_string($gpaInput)) {
            $numericGpa = trim(str_replace('%', '', $gpaInput));
            // Ensure that after stripping '%', the value is actually numeric or empty
            if ($numericGpa === '' || is_numeric($numericGpa)) {
                $request->merge(['gpa' => $numericGpa === '' ? null : $numericGpa]);
            } else {
                // If it's not numeric after stripping (e.g., "abc%"), set to null to let validation catch it as non-numeric if required, or handle as an error
                $request->merge(['gpa' => null]); 
            }
        } elseif (is_numeric($gpaInput)) {
            // It's already a number, do nothing
        } elseif ($gpaInput !== null) { // If it's not null, not a string, and not numeric (e.g. empty array from form)
             $request->merge(['gpa' => null]);
        }
        // If $gpaInput was null initially, it remains null, which is fine for 'nullable' validation.

        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255', // Assuming you'll store first/last name separately or combine them
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:student_profiles,email', // Unique in student_profiles table
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'zip_code' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'school_type' => 'required|in:high_school,college',
            'school_level' => 'required|string|max:255',
            'school_name' => 'required|string|max:255',
            'student_id_number' => 'nullable|string|max:255', // Assuming 'student_id' in model is this
            'gpa' => 'nullable|numeric|min:0|max:100', // Updated max to 100
        ]);

        // Create the student profile
        $studentProfile = StudentProfile::create([
            'first_name' => $validatedData['first_name'],
            'last_name' => $validatedData['last_name'],
            'user_id' => null, // No user associated yet
            'email' => $validatedData['email'],
            'status' => 'unclaimed',
            'address' => $validatedData['address'],
            'city' => $validatedData['city'],
            'state' => $validatedData['state'],
            'zip_code' => $validatedData['zip_code'],
            'phone_number' => $validatedData['phone_number'],
            'school_type' => $validatedData['school_type'],
            'school_level' => $validatedData['school_level'],
            'school_name' => $validatedData['school_name'],
            'student_id' => $validatedData['student_id_number'] ?? null, // Ensure key matches model's fillable
            'gpa' => $validatedData['gpa'] ?? null,
        ]);

        return redirect()->route('admin.students.index')->with('success', 'Student profile created successfully.');
        // Or redirect to a show page for this new profile if you create one that doesn't rely on a User model yet.
        // return redirect()->route('admin.student_profiles.show', $studentProfile->id)->with('success', 'Student profile created successfully.');
    }

    /**
     * Display a listing of all students.
     */
    public function index(Request $request): Response
    {
        $query = StudentProfile::query()
            ->with('user'); // Eager load the associated user, if any

        // Apply search filter
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm): void {
                // Search on StudentProfile fields
                $q->where('first_name', 'like', "%{$searchTerm}%")
                  ->orWhere('last_name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%") // StudentProfile email
                  ->orWhere('student_id', 'like', "%{$searchTerm}%")
                  ->orWhere('school_name', 'like', "%{$searchTerm}%")
                  // Search on related User fields
                  ->orWhereHas('user', function ($userQuery) use ($searchTerm): void {
                      $userQuery->where('name', 'like', "%{$searchTerm}%")
                                ->orWhere('email', 'like', "%{$searchTerm}%"); // User email
                  });
            });
        }

        // Apply school type filter
        if ($request->filled('filter_school_type') && $request->input('filter_school_type') !== 'all') {
            $schoolType = $request->input('filter_school_type');
            $query->where('school_type', $schoolType);
        }

        $studentProfilesPaginator = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through(function ($profile) {
                $profileData = $profile->toArray();
                // The 'user' relationship will already be an object or null due to toArray() and eager loading.
                // If user exists, it's $profileData['user']. If not, $profileData['user'] will be null.
                // No specific snake_case to camelCase transformation needed here for 'user' as it's a direct relationship name.
                return $profileData;
            });

        return Inertia::render('Admin/Student/Index', [
            // Rename 'students' to 'studentProfiles' for clarity, or adjust frontend to expect this structure under 'students'
            'studentProfiles' => $studentProfilesPaginator, 
            'filters' => $request->only(['search', 'filter_school_type']),
        ]);
    }

    /**
     * Display the specified student.
     */
    public function show(User $student): Response
    {
        abort_if($student->role !== 'student', 404);

        $student->load([
            'studentProfile.scholarshipApplications' => function ($query): void {
                $query->with(['scholarshipProgram', 'documentUploads', 'disbursements']);
            },
        ]);

        // Convert the main student model to an array for transformation
        $studentData = $student->toArray();

        // Handle the student_profile key transformation
        if (isset($studentData['student_profile'])) {
            $studentData['studentProfile'] = $studentData['student_profile'];
            unset($studentData['student_profile']);
        } else {
            // Ensure studentProfile key exists even if null, for frontend consistency
            $studentData['studentProfile'] = null;
        }

        // Extract applications from the (potentially transformed) studentProfile data
        // The scholarshipApplications relationship is part of student_profile data
        $rawApplications = [];
        if (isset($studentData['studentProfile']['scholarship_applications']) && is_array($studentData['studentProfile']['scholarship_applications'])) {
            $rawApplications = $studentData['studentProfile']['scholarship_applications'];
        }

        $applicationsCollection = collect($rawApplications)->map(function ($appArray) {
            // If scholarshipProgram, documentUploads, etc. are also snake_case inside appArray, transform them here too.
            // For now, assuming they are handled correctly or are already camelCase/not an issue.
            if (isset($appArray['scholarship_program'])) {
                $appArray['scholarshipProgram'] = $appArray['scholarship_program'];
                unset($appArray['scholarship_program']);
            }

            if (isset($appArray['document_uploads'])) {
                $appArray['documentUploads'] = $appArray['document_uploads'];
                unset($appArray['document_uploads']);
            }

            if (isset($appArray['disbursements'])) {
                unset($appArray['disbursements']);
            }

            return $appArray; // Return the array, it will be part of a Laravel Collection
        });

        $pendingApplications = $applicationsCollection->filter(fn($app): bool => in_array($app['status'] ?? '', ['submitted', 'documents_pending', 'documents_under_review']));

        $activeApplications = $applicationsCollection->filter(fn($app): bool => in_array($app['status'] ?? '', ['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 'disbursement_pending']));

        $completedApplications = $applicationsCollection->filter(fn($app): bool => in_array($app['status'] ?? '', ['disbursement_processed', 'completed']));

        $rejectedApplications = $applicationsCollection->filter(fn($app): bool => in_array($app['status'] ?? '', ['documents_rejected', 'rejected']));

        return Inertia::render('Admin/Student/Show', [
            'student' => $studentData, // Pass the transformed array
            'applications' => [
                'all' => $applicationsCollection->all(), // Convert back to simple array for consistency if needed
                'pending' => $pendingApplications->values()->all(),
                'active' => $activeApplications->values()->all(),
                'completed' => $completedApplications->values()->all(),
                'rejected' => $rejectedApplications->values()->all(),
            ],
        ]);
    }
}
