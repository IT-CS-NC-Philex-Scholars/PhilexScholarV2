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
     * Apply Facebook avatar as profile picture
     */
    public function applyFacebookAvatar(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->facebook_avatar) {
            return response()->json([
                'success' => false,
                'message' => 'No Facebook avatar available'
            ], 400);
        }

        try {
            // Download the Facebook avatar
            $imageContent = file_get_contents($user->facebook_avatar);
            
            if ($imageContent === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to download Facebook avatar'
                ], 400);
            }

            // Generate a unique filename
            $filename = 'avatars/' . $user->id . '_' . time() . '.jpg';
            
            // Process and save the image
            $image = Image::make($imageContent)
                ->resize(300, 300)
                ->encode('jpg', 85);
            
            Storage::disk('public')->put($filename, $image);
            
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            
            // Update user avatar
            $user->update(['avatar' => $filename]);
            
            return response()->json([
                'success' => true,
                'message' => 'Facebook avatar applied successfully',
                'avatar_url' => $user->getAvatarUrl()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply Facebook avatar: ' . $e->getMessage()
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
