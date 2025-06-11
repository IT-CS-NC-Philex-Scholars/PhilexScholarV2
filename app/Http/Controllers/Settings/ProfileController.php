<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use Inertia\Response;

final class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()?->fill($request->validated());

        if ($request->user()?->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()?->save();

        return to_route('profile.edit');
    }

    /**
     * Upload avatar for user
     */
    public function uploadAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', File::image()->max(5120)], // 5MB max
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        
        $user->update(['avatar' => $path]);

        return redirect()->back()->with('success', 'Avatar updated successfully');
    }

    /**
     * Upload cover image for user
     */
    public function uploadCoverImage(Request $request): RedirectResponse
    {
        $request->validate([
            'cover_image' => ['required', File::image()->max(10240)], // 10MB max
        ]);

        $user = $request->user();

        // Delete old cover image if exists
        if ($user->cover_image) {
            Storage::disk('public')->delete($user->cover_image);
        }

        $path = $request->file('cover_image')->store('covers', 'public');
        
        $user->update(['cover_image' => $path]);

        return redirect()->back()->with('success', 'Cover image updated successfully');
    }

    /**
     * Use Facebook avatar as current avatar
     */
    public function useFacebookAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->facebook_avatar) {
            return redirect()->back()->with('error', 'No Facebook avatar available');
        }

        // Delete current avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Download Facebook avatar
        try {
            $response = \Illuminate\Support\Facades\Http::get($user->facebook_avatar);
            
            if ($response->successful()) {
                $filename = "avatars/facebook_{$user->id}_" . time() . ".jpg";
                Storage::disk('public')->put($filename, $response->body());
                
                $user->update(['avatar' => $filename]);
                
                return redirect()->back()->with('success', 'Facebook avatar set successfully');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to download Facebook avatar');
        }

        return redirect()->back()->with('error', 'Failed to set Facebook avatar');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user?->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
