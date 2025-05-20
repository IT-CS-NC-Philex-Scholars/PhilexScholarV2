<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        
        // Create student users
        $student1 = User::create([
            'name' => 'John Doe',
            'email' => 'student@example.com',
            'password' => bcrypt('password'),
            'role' => 'student',
        ]);
        
        // Create profile for first student
        StudentProfile::create([
            'user_id' => $student1->id,
            'address' => '123 Student St',
            'city' => 'College City',
            'state' => 'State',
            'zip_code' => '12345',
            'phone_number' => '555-123-4567',
            'school_type' => 'college',
            'school_level' => 'Junior',
            'school_name' => 'State University',
        ]);
        
        // Create more students without profiles
        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => bcrypt('password'),
            'role' => 'student',
        ]);
        
        User::create([
            'name' => 'Bob Johnson',
            'email' => 'bob@example.com',
            'password' => bcrypt('password'),
            'role' => 'student',
        ]);
    }
}