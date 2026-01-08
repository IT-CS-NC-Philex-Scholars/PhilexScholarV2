# System Architecture

## Technology Stack

### Backend: Laravel 10/11
-   **Architecture**: MVC (Model-View-Controller).
-   **Authentication**: Laravel default auth (Session-based) + Spatie Login Link for dev.
-   **Database**: Eloquent ORM.
-   **API**: Internal API consumed by Inertia.js.

### Frontend: React + Inertia.js
-   **Inertia.js**: Acts as the glue. It allows us to build a Single Page Application (SPA) without building a separate API. We return `Inertia::render('PageName', $data)` from Laravel controllers.
-   **React 19**: The view layer.
-   **Tailwind CSS**: Styling.
-   **Shadcn UI**: Component library (Radix UI based).

## Folder Structure

### `app/` (Backend Logic)
-   **`Models/`**: Eloquent models (`User`, `ScholarshipApplication`, etc.).
-   **`Http/Controllers/`**:
    -   `Admin/`: Controllers for the admin panel.
    -   `Student/`: Controllers for the student portal.
-   **`Http/Middleware/`**: Custom middleware like `EnsureUserIsAdmin` and `EnsureUserIsStudent`.

### `database/`
-   **`migrations/`**: Database schema definitions.
-   **`seeders/`**: Populates the DB with test data (`DatabaseSeeder`, `UserSeeder`).

### `resources/js/` (Frontend)
-   **`Pages/`**: The main views. Structure mirrors the Controller namespaces.
    -   `Admin/`: Admin dashboard pages.
    -   `Student/`: Student portal pages.
    -   `Auth/`: Login/Register pages.
-   **`Components/`**: Reusable UI components (Buttons, Cards, Inputs).
-   **`layouts/`**:
    -   `AuthenticatedLayout`: Sidebar + Navbar wrapper.
    -   `GuestLayout`: Login page wrapper.
-   **`types/`**: TypeScript interfaces.

### `routes/`
-   **`web.php`**: Main entry point.
-   **`admin.php`**: Grouped routes for `/admin` (protected by middleware).
-   **`student.php`**: Grouped routes for `/student` (protected by middleware).

## Key Design Patterns

### Role-Based Access Control (RBAC)
We use a simple role system on the `User` model: `role` enum ('admin', 'student').
Middleware ensures users cannot access routes meant for other roles.

### Service Pattern (Implicit)
Complex logic (like calculating slots or handling file uploads) is often handled within the Controllers or dedicated Model methods to keep things organized, though a strict Service repository pattern is not enforced for simplicity.
