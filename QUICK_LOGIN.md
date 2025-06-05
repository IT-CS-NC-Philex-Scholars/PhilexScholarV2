# Quick Login for Development

This document describes the quick login features available for development and testing purposes.

## Overview

To make development and testing easier, this application uses the **Spatie Laravel Login Link** package integrated with Inertia.js to provide seamless quick login functionality that bypasses the need to manually enter credentials every time.

**⚠️ Important: These features are only available in development/local environments and are automatically disabled in production.**

## Available Quick Login Methods

### 1. Spatie Login Links (Login Page)

When visiting the login page (`/login`) in development mode, you'll see **Spatie Login Links** at the bottom of the form. These buttons are dynamically generated from your database users and include:

- **Login as Admin (Admin User)** - Logs in as `admin@example.com`
- **Login as Student (John Doe)** - Logs in as `student@example.com` (has profile)
- **Login as Student (Jane Smith)** - Logs in as `jane@example.com` (no profile)
- **Login as Student (Bob Johnson)** - Logs in as `bob@example.com` (no profile)

Each button shows a colored indicator (red for admin, blue for students) and automatically logs you in with a single click.

### 2. Instant Login URLs (Legacy)

For backward compatibility, you can still directly visit these URLs in your browser:

- `/dev/login/admin` - Instant login as Admin
- `/dev/login/student` - Instant login as Student (John Doe)
- `/dev/login/jane` - Instant login as Jane Smith
- `/dev/login/bob` - Instant login as Bob Johnson

These URLs immediately log you in and redirect to the dashboard.

## Seeded User Accounts

The following test accounts are available (password: `password` for all):

| Role | Name | Email | Features |
|------|------|-------|----------|
| Admin | Admin User | admin@example.com | Full admin access |
| Student | John Doe | student@example.com | Has complete profile |
| Student | Jane Smith | jane@example.com | No profile (good for testing onboarding) |
| Student | Bob Johnson | bob@example.com | No profile |

## Technical Implementation

This implementation uses the [Spatie Laravel Login Link](https://github.com/spatie/laravel-login-link) package with custom Inertia.js integration:

- **Backend**: `LoginLinkHelper` class generates login data for all users
- **Frontend**: `SpatieLoginLinks` React component renders the login buttons
- **Integration**: Controller passes login links data to the Inertia page

The system automatically detects all users in your database and creates login links for them.

## Setup

Make sure your database is seeded with test users:

```bash
php artisan migrate:fresh --seed
```

Or seed just the users:

```bash
php artisan db:seed --class=UserSeeder
```

The Spatie package is configured in `config/login-link.php` with the following settings:
- Allowed environments: `local`
- Allowed hosts: `localhost`, `127.0.0.1`, `*.test`
- Auto-create missing users: `true`
- Redirect after login: `dashboard` route

## Security

- Quick login features are automatically disabled when `APP_ENV` is not `local`
- The Spatie package enforces environment and host restrictions
- The instant login URLs (`/dev/*`) are only registered in development environments
- No production credentials are exposed through this system
- All login attempts go through Laravel's standard authentication flow

## Usage Tips

1. **For UI Testing**: Use the Spatie login link buttons on the login page
2. **For API Testing**: Use the instant login URLs (legacy method)
3. **For Profile Testing**: Use John Doe (has profile) vs Jane Smith (no profile)
4. **For Role Testing**: Switch between Admin and Student accounts easily
5. **Dynamic Users**: The system automatically detects new users added to the database

## Customization

To add more quick login options:

1. **Add Users**: Simply add users to `database/seeders/UserSeeder.php` - they'll automatically appear in the login links
2. **Modify Labels**: Edit the `generateLabel()` method in `app/Helpers/LoginLinkHelper.php`
3. **Customize Appearance**: Modify the `SpatieLoginLinks` component in `resources/js/components/spatie-login-links.tsx`
4. **Configuration**: Adjust settings in `config/login-link.php`

## Package Dependencies

- `spatie/laravel-login-link` - Provides the core login link functionality
- Custom `LoginLinkHelper` class - Bridges Spatie package with Inertia.js
- Custom `SpatieLoginLinks` React component - Renders the UI