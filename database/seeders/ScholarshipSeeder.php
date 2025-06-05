<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\DocumentRequirement;
use App\Models\ScholarshipProgram;
use Illuminate\Database\Seeder;

final class ScholarshipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a sample college scholarship program
        $collegeScholarship = \App\Models\ScholarshipProgram::query()->create([
            'name' => 'Merit Academic Excellence Scholarship',
            'description' => 'This scholarship rewards academic excellence and is designed for college students maintaining a high GPA. Recipients are expected to maintain their academic standing and contribute to the community through service.',
            'total_budget' => 500000,
            'per_student_budget' => 10000,
            'school_type_eligibility' => 'college',
            'min_gpa' => 85.0,
            'min_units' => 15,
            'semester' => 'Fall',
            'academic_year' => '2024-2025',
            'application_deadline' => now()->addMonths(3),
            'community_service_days' => 6,
            'active' => true,
        ]);

        // Add document requirements for the college scholarship
        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $collegeScholarship->id,
            'name' => 'Proof of Enrollment',
            'description' => 'Official document showing enrollment with at least 15 units for the current semester',
            'is_required' => true,
        ]);

        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $collegeScholarship->id,
            'name' => 'Grade Transcript',
            'description' => 'Official transcript showing GPA of at least 85%',
            'is_required' => true,
        ]);

        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $collegeScholarship->id,
            'name' => 'Government ID',
            'description' => 'Valid government-issued identification',
            'is_required' => true,
        ]);

        // Create a sample high school scholarship program
        $highSchoolScholarship = \App\Models\ScholarshipProgram::query()->create([
            'name' => 'Future Leaders Scholarship',
            'description' => 'Designed for promising high school students who demonstrate leadership potential and academic achievement. Recipients will receive financial support and mentoring opportunities.',
            'total_budget' => 250000,
            'per_student_budget' => 5000,
            'school_type_eligibility' => 'high_school',
            'min_gpa' => 80.0,
            'min_units' => null,
            'semester' => 'Fall',
            'academic_year' => '2024-2025',
            'application_deadline' => now()->addMonths(2),
            'community_service_days' => 4,
            'active' => true,
        ]);

        // Add document requirements for the high school scholarship
        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $highSchoolScholarship->id,
            'name' => 'School ID',
            'description' => 'Current school ID card',
            'is_required' => true,
        ]);

        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $highSchoolScholarship->id,
            'name' => 'Report Card',
            'description' => 'Most recent report card showing grades of at least 80%',
            'is_required' => true,
        ]);

        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $highSchoolScholarship->id,
            'name' => 'Parent/Guardian Authorization',
            'description' => 'Signed consent form from parent or guardian',
            'is_required' => true,
        ]);
    }
}
