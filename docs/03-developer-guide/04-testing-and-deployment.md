# Testing & Deployment

## Testing

We use **Pest PHP**, an elegant wrapper around PHPUnit.

### Running Tests
```bash
# Run all tests
php artisan test

# Run a specific file
php artisan test tests/Feature/Auth/AuthenticationTest.php
```

### Test Structure
-   **`tests/Feature/`**: Tests full HTTP requests and controller logic.
    -   `Admin/`: Admin-specific flows (creating programs, reviewing docs).
    -   `Student/`: Student flows (applying, uploading).
-   **`tests/Unit/`**: Tests specific model logic or helper functions.

### Writing a New Test
Example of a Feature test:
```php
test('student can view dashboard', function () {
    $student = User::factory()->create(['role' => 'student']);
    
    $response = $this->actingAs($student)
        ->get('/student/dashboard');

    $response->assertStatus(200);
});
```

---

## Deployment

### Requirements
-   Web Server (Nginx/Apache)
-   PHP 8.2+ (FPM)
-   MySQL/PostgreSQL
-   Supervisor (for Queue Workers)

### Steps

1.  **Clone & Install**:
    ```bash
    git clone ...
    composer install --no-dev --optimize-autoloader
    npm install && npm run build
    ```

2.  **Environment**:
    -   Set `APP_ENV=production`
    -   Set `APP_DEBUG=false`
    -   Configure database and mail settings.

3.  **Optimize**:
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

4.  **Database**:
    ```bash
    php artisan migrate --force
    ```

5.  **Permissions**:
    Ensure `storage/` and `bootstrap/cache/` are writable by the web server user (usually `www-data`).
    ```bash
    chown -R www-data:www-data storage bootstrap/cache
    chmod -R 775 storage bootstrap/cache
    ```

### CI/CD
We have GitHub Actions workflows configured in `.github/workflows/`.
-   **Tests**: Runs on every Push/PR.
-   **Style**: Checks coding standards (Pint/Prettier).
