<?php

declare(strict_types=1);

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use NotificationChannels\WebPush\HasPushSubscriptions;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 *
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
final class User extends Authenticatable 
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use HasPushSubscriptions;
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'cover_image',
        'facebook_id',
        'facebook_avatar',
        'facebook_profile_url',
        'provider',
        'provider_id',
        'provider_data',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the student profile associated with the user.
     */
    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'string',
            'provider_data' => 'array',
        ];
    }

    /**
     * Get the user's avatar URL
     */
    public function getAvatarUrl(): ?string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        
        return null;
    }

    /**
     * Get the user's cover image URL
     */
    public function getCoverImageUrl(): ?string
    {
        if ($this->cover_image) {
            return asset('storage/' . $this->cover_image);
        }
        
        return null;
    }

    /**
     * Get the user's Facebook avatar URL
     */
    public function getFacebookAvatarUrl(): ?string
    {
        return $this->facebook_avatar;
    }

    /**
     * Check if user has a Facebook profile
     */
    public function hasFacebookProfile(): bool
    {
        return !empty($this->facebook_id) || !empty($this->facebook_profile_url);
    }

    /**
     * Get Facebook profile URL from Facebook ID
     */
    public function getFacebookProfileUrl(): ?string
    {
        if ($this->facebook_profile_url) {
            return $this->facebook_profile_url;
        }
        
        if ($this->facebook_id) {
            return "https://facebook.com/{$this->facebook_id}";
        }
        
        return null;
    }

    /**
     * Check if user logged in via OAuth provider
     */
    public function isOAuthUser(): bool
    {
        return !empty($this->provider);
    }

    /**
     * Check if user logged in via Facebook
     */
    public function isFacebookUser(): bool
    {
        return $this->provider === 'facebook';
    }

    /**
     * Get the best available avatar (prioritize uploaded, then Facebook)
     */
    public function getBestAvatarUrl(): ?string
    {
        if ($this->avatar) {
            return $this->getAvatarUrl();
        }
        
        if ($this->facebook_avatar) {
            return $this->facebook_avatar;
        }
        
        return null;
    }

    /**
     * Check if user can use Facebook avatar as profile picture
     */
    public function canUseFacebookAvatar(): bool
    {
        return !empty($this->facebook_avatar) && empty($this->avatar);
    }
}
