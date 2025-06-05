<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\DocumentRequirement;
use App\Models\ScholarshipProgram;
use App\Models\User;
use Illuminate\Database\Seeder;

final class ScholarshipSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        \App\Models\User::query()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create sample scholarship programs
        $collegeScholarship = \App\Models\ScholarshipProgram::query()->create([
            'name' => 'College Merit Scholarship',
            'description' => 'Scholarship for college students with high academic achievement.',
            'total_budget' => 500000,
            'per_student_budget' => 10000,
            'school_type_eligibility' => 'college',
            'min_gpa' => 80.0,
            'min_units' => 15,
            'semester' => '1st Semester',
            'academic_year' => '2024-2025',
            'application_deadline' => now()->addMonths(3),
            'community_service_days' => 6,
            'active' => true,
        ]);

        $highSchoolScholarship = \App\Models\ScholarshipProgram::query()->create([
            'name' => 'High School Excellence Scholarship',
            'description' => 'Scholarship for high school students with exceptional academic performance.',
            'total_budget' => 300000,
            'per_student_budget' => 5000,
            'school_type_eligibility' => 'high_school',
            'min_gpa' => 85.0,
            'min_units' => null,
            'semester' => '1st Semester',
            'academic_year' => '2024-2025',
            'application_deadline' => now()->addMonths(3),
            'community_service_days' => 4,
            'active' => true,
        ]);

        // Create document requirements for college scholarship
        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $collegeScholarship->id,
            'name' => 'Proof of Enrollment',
            'description' => 'Official document showing current enrollment with at least 15 units',
            'is_required' => true,
        ]);

        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $collegeScholarship->id,
            'name' => 'Grade Slip',
            'description' => 'Official grade report showing GPA of at least 80%',
            'is_required' => true,
        ]);

        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $collegeScholarship->id,
            'name' => 'Proof of Identity',
            'description' => 'Government-issued ID',
            'is_required' => true,
        ]);

        // Create document requirements for high school scholarship
        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $highSchoolScholarship->id,
            'name' => 'School ID',
            'description' => 'Current school ID',
            'is_required' => true,
        ]);

        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $highSchoolScholarship->id,
            'name' => 'Report Card',
            'description' => 'Official report card showing grades of at least 85%',
            'is_required' => true,
        ]);

        \App\Models\DocumentRequirement::query()->create([
            'scholarship_program_id' => $highSchoolScholarship->id,
            'name' => 'Proof of Identity',
            'description' => 'Government-issued ID or birth certificate',
            'is_required' => true,
        ]);
    }
}
