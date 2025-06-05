<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\DocumentUpload;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipProgram;
use App\Models\StudentProfile;
use Illuminate\Database\Seeder;

final class ApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the student profile (first student from UserSeeder)
        $studentProfile = \App\Models\StudentProfile::query()->first();

        if (! $studentProfile) {
            echo "No student profile found. Skipping application seeding.\n";

            return;
        }

        // Get the college scholarship program
        $scholarship = \App\Models\ScholarshipProgram::query()->where('school_type_eligibility', 'college')->first();

        if (! $scholarship) {
            echo "No college scholarship found. Skipping application seeding.\n";

            return;
        }

        // Create a scholarship application
        $application = \App\Models\ScholarshipApplication::query()->create([
            'student_profile_id' => $studentProfile->id,
            'scholarship_program_id' => $scholarship->id,
            'status' => 'documents_under_review',
            'admin_notes' => null,
            'submitted_at' => now()->subDays(5),
            'reviewed_at' => null,
        ]);

        // Upload documents for the application
        $documentRequirements = $scholarship->documentRequirements;

        foreach ($documentRequirements as $requirement) {
            \App\Models\DocumentUpload::query()->create([
                'scholarship_application_id' => $application->id,
                'document_requirement_id' => $requirement->id,
                'file_path' => 'sample/documents/sample-'.$requirement->id.'.pdf',
                'original_filename' => 'sample-document-'.$requirement->id.'.pdf',
                'status' => 'pending_review',
                'rejection_reason' => null,
                'uploaded_at' => now()->subDays(5),
                'reviewed_at' => null,
            ]);
        }
    }
}
