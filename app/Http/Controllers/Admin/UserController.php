<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $usersQuery = User::query();

        if ($search) {
            $usersQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $usersQuery->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at?->format('M d, Y'),
                    'avatar' => $user->getBestAvatarUrl(),
                ];
            });

        return Inertia::render('Admin/User/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'in:admin,student'],
        ]);

        $user = User::create($validated);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'role' => ['required', 'in:admin,student'],
        ]);

        $user->fill($validated);
        $user->save();

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        if ($user->id === \Illuminate\Support\Facades\Auth::id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }

    /**
     * Impersonate a user.
     */
    public function impersonate(Request $request, User $user)
    {
        // Guard against impersonating yourself or other admins if needed
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot impersonate yourself.');
        }

        // Store original user ID in session
        session()->put('impersonator_id', $request->user()->id);

        // Login as the user
        \Illuminate\Support\Facades\Auth::login($user);

        return redirect()->route('dashboard')->with('success', "You are now impersonating {$user->name}");
    }

    /**
     * Stop impersonating.
     */
    public function stopImpersonating()
    {
        if (! session()->has('impersonator_id')) {
            return back()->with('error', 'You are not impersonating anyone.');
        }

        // Login back as original user
        \Illuminate\Support\Facades\Auth::loginUsingId(session('impersonator_id'));

        // Clear session
        session()->forget('impersonator_id');

        return redirect()->route('admin.users.index')->with('success', 'Welcome back!');
    }
}
