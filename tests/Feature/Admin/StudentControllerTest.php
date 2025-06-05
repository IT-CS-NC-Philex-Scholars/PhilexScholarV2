<?php

declare(strict_types=1);

use App\Models\StudentProfile;
use App\Models\User;

test('admin can view students list', function (): void {
    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create some student users
    $students = User::factory()->count(3)->create([
        'role' => 'student',
    ]);

    // Add a student profile for one of the students
    StudentProfile::factory()->create([
        'user_id' => $students[0]->id,
        'student_id' => 'S12345',
        'gpa' => 3.75,
    ]);

    // Visit the students index page as admin
    $response = $this->actingAs($admin)
        ->get(route('admin.students.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Student/Index')
        ->has('students.data', 3)
    );
});

test('admin can view a specific student', function (): void {
    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create a student user
    $student = User::factory()->create([
        'role' => 'student',
    ]);

    // Create a student profile
    $profile = StudentProfile::factory()->create([
        'user_id' => $student->id,
        'student_id' => 'S12345',
        'gpa' => 3.75,
    ]);

    // Visit the student show page as admin
    $response = $this->actingAs($admin)
        ->get(route('admin.students.show', $student));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Student/Show')
        ->has('student')
        ->where('student.id', $student->id)
    );
});

test('admin can search for students', function (): void {
    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create a student with a specific name
    $searchableStudent = User::factory()->create([
        'role' => 'student',
        'name' => 'Unique Student Name',
        'email' => 'unique.student@example.com',
    ]);

    // Create a student profile with a specific student ID
    StudentProfile::factory()->create([
        'user_id' => $searchableStudent->id,
        'student_id' => 'UNIQUE123',
    ]);

    // Create other students
    User::factory()->count(5)->create([
        'role' => 'student',
    ]);

    // Search for the unique student by name
    $response = $this->actingAs($admin)
        ->get(route('admin.students.index', ['search' => 'Unique']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Student/Index')
    );

    // Search for the unique student by student ID
    $response = $this->actingAs($admin)
        ->get(route('admin.students.index', ['search' => 'UNIQUE123']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Student/Index')
    );
});
