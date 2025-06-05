<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
// ScholarshipApplication is used in the show method, but not directly queried here for index/show student lists
// use App\Models\ScholarshipApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

// No need for LengthAwarePaginator import if we use through()

final class StudentController extends Controller
{
    /**
     * Display a listing of all students.
     */
    public function index(Request $request): Response
    {
        $query = \App\Models\User::query()->where('role', 'student')
            ->with(['studentProfile' => function ($query): void {
                // Ensure all necessary fields from student_profiles are selected
                // select('*') is default but explicit can be fine.
                $query->select('*');
            }]);

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('studentProfile', function ($sq) use ($search): void {
                        $sq->where('student_id', 'like', "%{$search}%")
                            ->orWhere('school_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('filter_school_type') && $request->filter_school_type !== 'all') {
            $query->whereHas('studentProfile', function ($q) use ($request): void {
                $q->where('school_type', $request->filter_school_type);
            });
        }

        $studentsPaginator = $query->latest()->paginate(15)->withQueryString();

        // Transform each student item in the pagination data
        $studentsPaginator->through(function ($student) {
            $studentData = $student->toArray(); // Convert model to array
            if (isset($studentData['student_profile'])) {
                $studentData['studentProfile'] = $studentData['student_profile'];
                unset($studentData['student_profile']);
            }

            // Ensure other relationships are handled if they were snake_case and needed camelCase
            // For now, only student_profile is being explicitly handled.
            return $studentData;
        });

        return Inertia::render('Admin/Student/Index', [
            'students' => $studentsPaginator,
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
