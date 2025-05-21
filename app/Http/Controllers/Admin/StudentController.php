<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ScholarshipApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class StudentController extends Controller
{
    /**
     * Display a listing of all students.
     */
    public function index(Request $request): Response
    {
        // Query only users with role 'student'
        $query = User::where('role', 'student')
            ->with('studentProfile');
            
        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('studentProfile', function ($sq) use ($search) {
                      $sq->where('student_id', 'like', "%{$search}%")
                        ->orWhere('school_name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Handle filters
        if ($request->has('filter_school_type') && $request->filter_school_type !== 'all') {
            $query->whereHas('studentProfile', function ($q) use ($request) {
                $q->where('school_type', $request->filter_school_type);
            });
        }
        
        $students = $query->latest()->paginate(15)->withQueryString();
        
        return Inertia::render('Admin/Student/Index', [
            'students' => $students,
            'filters' => $request->only(['search', 'filter_school_type']),
        ]);
    }
    
    /**
     * Display the specified student.
     */
    public function show(User $student): Response
    {
        // Make sure the user is a student
        if ($student->role !== 'student') {
            abort(404);
        }
        
        // Load student profile and applications
        $student->load([
            'studentProfile',
            'studentProfile.scholarshipApplications' => function ($query) {
                $query->with(['scholarshipProgram', 'documentUploads', 'disbursements']);
            },
        ]);
        
        // Get all applications (ensuring we have a collection even if scholarshipApplications is null)
        $applications = $student->studentProfile && $student->studentProfile->scholarshipApplications
            ? $student->studentProfile->scholarshipApplications 
            : collect([]);
        
        // Group applications by status
        $pendingApplications = $applications->filter(function ($app) {
            return in_array($app->status ?? '', ['submitted', 'documents_pending', 'documents_under_review']);
        });
        
        $activeApplications = $applications->filter(function ($app) {
            return in_array($app->status ?? '', ['documents_approved', 'eligibility_verified', 'enrolled', 
                'service_pending', 'service_completed', 'disbursement_pending']);
        });
        
        $completedApplications = $applications->filter(function ($app) {
            return in_array($app->status ?? '', ['disbursement_processed', 'completed']);
        });
        
        $rejectedApplications = $applications->filter(function ($app) {
            return in_array($app->status ?? '', ['documents_rejected', 'rejected']);
        });
        
        return Inertia::render('Admin/Student/Show', [
            'student' => $student,
            'applications' => [
                'all' => $applications,
                'pending' => $pendingApplications,
                'active' => $activeApplications,
                'completed' => $completedApplications,
                'rejected' => $rejectedApplications,
            ],
        ]);
    }
}