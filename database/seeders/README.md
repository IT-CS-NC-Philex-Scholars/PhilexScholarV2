# Database Seeders for Scholarship Management System

## Available Seeders

### 1. UserSeeder

Creates sample users with different roles:

- **Admin User**:
  - Email: admin@example.com
  - Password: password
  - Role: admin

- **Student User (with complete profile)**:
  - Email: student@example.com
  - Password: password
  - Role: student
  - Profile: College student with complete details

- **Additional Student Users** (without profiles):
  - jane@example.com (password: password)
  - bob@example.com (password: password)

### 2. ScholarshipSeeder

Creates sample scholarship programs:

- **Merit Academic Excellence Scholarship**
  - For college students
  - Budget: $500,000 total / $10,000 per student
  - Requirements: 85% GPA, 15 units minimum
  - Document requirements: Proof of Enrollment, Grade Transcript, Government ID

- **Future Leaders Scholarship**
  - For high school students
  - Budget: $250,000 total / $5,000 per student
  - Requirements: 80% GPA
  - Document requirements: School ID, Report Card, Parent/Guardian Authorization

### 3. ApplicationSeeder

Creates a sample scholarship application:

- Student: John Doe (student@example.com)
- Scholarship: Merit Academic Excellence Scholarship
- Status: Documents Under Review
- Includes uploaded documents pending review

## Running the Seeders

To seed the database with sample data:

```bash
php artisan migrate:fresh --seed
```

This will create all the sample data needed to test the application.

## Using the Sample Data

### Admin Access

Login with admin@example.com / password to access the admin dashboard.

### Student Access

Login with student@example.com / password to access a student account with a complete profile.

Or use jane@example.com / password to test the profile completion workflow.