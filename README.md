# PhilexScholarV2 - Scholarship Management System

PhilexScholarV2 is a comprehensive, modern web application designed to streamline the management of educational scholarships. It provides a seamless experience for students to find and apply for scholarships, while offering administrators robust tools to manage programs, review applications, verify documents, and process disbursements.

Built with **Laravel** and **React (via Inertia.js)**, this project combines a powerful backend with a reactive, modern frontend interface.

---

## 🚀 Key Features

### For Students
*   **Intuitive Dashboard**: A centralized hub to view active applications, upcoming deadlines, and profile status.
*   **Smart Scholarship Matching**: Browse scholarships automatically filtered by your school type (High School vs. College) and eligibility.
*   **Streamlined Application Process**:
    *   **Step-by-step Workflow**: Clear guidance from application draft to submission.
    *   **Document Management**: Upload requirements with real-time status tracking (Pending, Approved, Rejected).
    *   **Resubmission**: Easy handling of rejected documents with clear feedback.
*   **Community Service Tracking**: dedicated tools to log service hours and submit reports.
*   **Profile Management**: Manage academic and personal details to ensure accurate eligibility checking.

### For Administrators & System Logic
*   **Program Management**:
    *   Define budgets, deadlines, and requirements.
    *   **Automatic Slot Calculation**: Slots are dynamically calculated based on `Total Budget / Per Student Budget`.
*   **Comprehensive Application Workflow**:
    1.  **Draft/Submission**: Initial intake.
    2.  **Document Review**: Verify uploaded files.
    3.  **Eligibility Verification**: System/Admin checks for GPA and Unit requirements.
    4.  **Enrollment**: Accepted students enter the program.
    5.  **Community Service**: Monitoring of required service days.
    6.  **Disbursement**: processing financial aid after requirements are met.
*   **Financial Tracking**: Monitor disbursements and remaining budget per program.

---

## 🛠️ Technology Stack

This project is built on a modern, type-safe, and robust stack:

*   **Backend Framework**: [Laravel 10/11](https://laravel.com)
*   **Frontend Framework**: [React 19](https://react.dev) with [TypeScript](https://www.typescriptlang.org/)
*   **Glue**: [Inertia.js](https://inertiajs.com) (Server-side routing with client-side SPA feel)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com)
*   **UI Components**: [Shadcn UI](https://ui.shadcn.com) & [Radix UI](https://www.radix-ui.com)
*   **Database**: PostgreSQL / MySQL
*   **Quality Assurance**:
    *   **PHPStan**: Max level static analysis.
    *   **Pest PHP**: Elegant testing framework.
    *   **Rector**: Automated refactoring.

---

## 🏗️ System Architecture & Workflow

The core of PhilexScholarV2 is the **Scholarship Application Lifecycle**. The system enforces a strict state machine to ensure data integrity:

1.  **Application Phase**: Student creates a profile -> Applies for a Program -> Submits Application.
2.  **Verification Phase**:
    *   Status: `documents_pending` -> `documents_under_review`.
    *   Admins review uploads. If rejected, status reverts for resubmission.
3.  **Approval Phase**:
    *   Status: `documents_approved` -> `eligibility_verified` -> `enrolled`.
    *   System checks if the student meets GPA/Unit criteria.
4.  **Maintenance Phase**:
    *   Status: `service_pending` -> `service_completed`.
    *   Students must submit Community Service Reports to qualify for funds.
5.  **Disbursement Phase**:
    *   Status: `disbursement_pending` -> `disbursement_processed` -> `completed`.

### Database Structure
Key entities include:
*   **Users & StudentProfiles**: Authentication and extended student details.
*   **ScholarshipPrograms**: Configuration of budgets, slots, and requirements.
*   **ScholarshipApplications**: The central pivot linking students to programs and tracking status.
*   **DocumentUploads & Requirements**: Handling file evidence.
*   **Disbursements**: Tracking financial transactions.

---

## 🏁 Getting Started

### Prerequisites
*   PHP 8.2+
*   Node.js & NPM
*   Composer
*   MySQL or PostgreSQL

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/PhilexScholarV2.git
    cd PhilexScholarV2
    ```

2.  **Install Backend Dependencies**
    ```bash
    composer install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```

4.  **Environment Setup**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    *Configure your database credentials in the `.env` file.*

5.  **Database Migration & Seeding**
    This will set up the schema and populate the database with default roles, admin accounts, and sample scholarship programs.
    ```bash
    php artisan migrate --seed
    ```

6.  **Start Development Server**
    ```bash
    npm run dev
    ```
    In a separate terminal:
    ```bash
    php artisan serve
    ```

---

## 📖 Usage Guide

### Logging In
*   **Admin**: Use the seeded admin credentials (check `database/seeders/DatabaseSeeder.php` or `UserSeeder.php`).
*   **Student**: Register a new account via the Sign Up page.

### Student Walkthrough
1.  **Complete Profile**: Upon registration, navigate to **Profile** to enter your school details (High School/College, Level, Address).
2.  **Browse Scholarships**: Go to the **Scholarships** tab. You will only see programs matching your school type.
3.  **Apply**: Click "Apply" on a program.
4.  **Upload Documents**: In the **Applications** view, upload the specific files required (e.g., Report Card, ID).
5.  **Track Status**: Watch your application move through the stages (Review, Enrollment, etc.).
6.  **Report Service**: Once enrolled, use the **Community Service** tab to log your volunteer hours.

---

## 🤝 How to Contribute

We welcome contributions to improve PhilexScholarV2!

### Development Standards
*   **Code Style**: We use Laravel Pint for PHP and Prettier for JS/TS.
*   **Type Safety**: Ensure strict typing in TypeScript and passing PHPStan checks.
*   **Testing**: Write tests for new features using Pest PHP.

### Steps to Contribute
1.  **Fork** the repository.
2.  Create a **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
