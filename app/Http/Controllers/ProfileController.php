<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;
use Intervention\Image\Facades\Image;

class ProfileController extends Controller
{
    /**
     * Apply OAuth avatar as profile picture (works for Facebook, Google, etc.)
     */
    public function applyOAuthAvatar(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->facebook_avatar) {
            $providerName = $user->provider ? ucfirst($user->provider) : 'OAuth';
            return response()->json([
                'success' => false,
                'message' => "No {$providerName} avatar available"
            ], 400);
        }

        try {
            $providerName = $user->provider ? ucfirst($user->provider) : 'OAuth';
            
            // Download the OAuth avatar
            $imageContent = file_get_contents($user->facebook_avatar);
            
            if ($imageContent === false) {
                return response()->json([
                    'success' => false,
                    'message' => "Failed to download {$providerName} avatar"
                ], 400);
            }

            // Generate a unique filename
            $filename = 'avatars/' . $user->id . '_' . time() . '.jpg';
            
            // Save the image directly (remove Intervention Image dependency for now)
            Storage::disk('public')->put($filename, $imageContent);
            
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            // Update user avatar
            $user->update(['avatar' => $filename]);
            
            return response()->json([
                'success' => true,
                'message' => "{$providerName} avatar applied successfully",
                'avatar_url' => $user->getAvatarUrl()
            ]);
            
        } catch (\Exception $e) {
            $providerName = $user->provider ? ucfirst($user->provider) : 'OAuth';
            return response()->json([
                'success' => false,
                'message' => "Failed to apply {$providerName} avatar: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update profile avatar
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $user = Auth::user();
        
        try {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            
            // Update user
            $user->update(['avatar' => $path]);
            
            return response()->json([
                'success' => true,
                'message' => 'Avatar updated successfully',
                'avatar_url' => $user->getAvatarUrl()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update cover image
     */
    public function updateCoverImage(Request $request): JsonResponse
    {
        $request->validate([
            'cover_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        $user = Auth::user();
        
        try {
            // Delete old cover image if exists
            if ($user->cover_image) {
                Storage::disk('public')->delete($user->cover_image);
            }
            
            // Store new cover image
            $path = $request->file('cover_image')->store('cover-images', 'public');
            
            // Update user
            $user->update(['cover_image' => $path]);
            
            return response()->json([
                'success' => true,
                'message' => 'Cover image updated successfully',
                'cover_image_url' => $user->getCoverImageUrl()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cover image: ' . $e->getMessage()
            ], 500);
        }
    }
}
