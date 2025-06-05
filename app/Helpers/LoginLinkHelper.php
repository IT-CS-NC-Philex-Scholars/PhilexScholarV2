<?php

declare(strict_types=1);

namespace App\Helpers;

use App\Models\User;
use Illuminate\Support\Collection;

class LoginLinkHelper
{
    /**
     * Generate login link data for Inertia.js components
     */
    public static function generateLoginLinks(): Collection
    {
        if (!app()->environment(config('login-link.allowed_environments', ['local']))) {
            return collect();
        }

        $users = User::all();

        return $users->map(function (User $user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'label' => self::generateLabel($user),
                'loginData' => [
                    'email' => $user->email,
                    'key' => $user->id,
                    'guard' => null,
                    'redirect_url' => route('dashboard'),
                    'user_attributes' => [],
                    'user_model' => null,
                ]
            ];
        });
    }

    /**
     * Generate a user-friendly label for the login link
     */
    protected static function generateLabel(User $user): string
    {
        $roleLabel = ucfirst($user->role ?? 'User');
        return "Login as {$roleLabel} ({$user->name})";
    }

    /**
     * Generate login link data for a specific user by email
     */
    public static function generateForEmail(string $email): ?array
    {
        if (!app()->environment(config('login-link.allowed_environments', ['local']))) {
            return null;
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'label' => self::generateLabel($user),
            'loginData' => [
                'email' => $user->email,
                'key' => $user->id,
                'guard' => null,
                'redirect_url' => route('dashboard'),
                'user_attributes' => [],
                'user_model' => null,
            ]
        ];
    }

    /**
     * Generate login link data for a specific user by ID
     */
    public static function generateForId(int $id): ?array
    {
        if (!app()->environment(config('login-link.allowed_environments', ['local']))) {
            return null;
        }

        $user = User::find($id);

        if (!$user) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'label' => self::generateLabel($user),
            'loginData' => [
                'email' => $user->email,
                'key' => $user->id,
                'guard' => null,
                'redirect_url' => route('dashboard'),
                'user_attributes' => [],
                'user_model' => null,
            ]
        ];
    }

    /**
     * Get the route name for login link submissions
     */
    public static function getLoginRoute(): string
    {
        return 'loginLinkLogin';
    }

    /**
     * Check if login links are enabled in current environment
     */
    public static function isEnabled(): bool
    {
        return app()->environment(config('login-link.allowed_environments', ['local']));
    }
}
