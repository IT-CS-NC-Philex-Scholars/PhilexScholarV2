# Installation & Project Setup

Now that your environment is ready (if not, go back to the [Environment Setup Guide](./02-environment-setup/README.md)), let's get PhilexScholarV2 running on your machine.

## 1. Get the Code

Open your terminal and navigate to the folder where you want to keep your projects.

```bash
git clone https://github.com/yourusername/PhilexScholarV2.git
cd PhilexScholarV2
```

## 2. Install Backend Dependencies

We use **Composer** to install the PHP libraries (Laravel, etc.).

```bash
composer install
```
*This may take a few minutes as it downloads the required packages.*

## 3. Install Frontend Dependencies

We use **NPM** to install the JavaScript libraries (React, Tailwind, etc.).

```bash
npm install
```

## 4. Configure Environment Variables

The application needs to know your database credentials and other settings. Laravel uses a `.env` file for this.

1.  **Create the file**:
    ```bash
    cp .env.example .env
    ```

2.  **Generate the App Key**:
    This is used to encrypt your user sessions and other data.
    ```bash
    php artisan key:generate
    ```

3.  **Edit the `.env` file**:
    Open the `.env` file in your code editor (like VS Code). Find the database section and update it to match the database you created.

    **For MySQL:**
    ```ini
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=philex_scholar
    DB_USERNAME=root      # Default for XAMPP/Laragon
    DB_PASSWORD=          # Default is empty
    ```

    **For PostgreSQL:**
    ```ini
    DB_CONNECTION=pgsql
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_DATABASE=philex_scholar
    DB_USERNAME=postgres
    DB_PASSWORD=your_password
    ```

## 5. Setup the Database (Migrate & Seed)

Now we will create the tables and add some sample data (admin account, sample scholarships).

```bash
php artisan migrate --seed
```

**What this does:**
- `migrate`: Creates tables like `users`, `scholarships`, `applications`.
- `--seed`: Fills those tables with test data (Default Admin, Sample Programs, Requirements).

## 6. Run the Application

You need to run two servers at the same time: one for the backend (PHP) and one for the frontend assets (Vite/Node).

**Terminal 1 (Backend):**
```bash
php artisan serve
```
*Output: Server running on [http://127.0.0.1:8000](http://127.0.0.1:8000)*

**Terminal 2 (Frontend):**
Open a new terminal tab/window in the project folder.
```bash
npm run dev
```

## 7. Access the App

Open your browser and go to:
[http://127.0.0.1:8000](http://127.0.0.1:8000)

## 🔑 Login Credentials

Since you ran the seeder, use these default accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `password` |
| **Student** | `student@example.com` | `password` |
