<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $address
 * @property string $city
 * @property string $state
 * @property string $zip_code
 * @property string $phone_number
 * @property string $school_type
 * @property string $school_level
 * @property string $school_name
 * @property string|null $email
 * @property string $status
 * @property string|null $first_name
 * @property string|null $last_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read User $user
 * @property-read \Illuminate\Database\Eloquent\Collection<int, ScholarshipApplication> $scholarshipApplications
 */
final class StudentProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'status',
        'user_id',
        'address',
        'city',
        'state',
        'zip_code',
        'phone_number',
        'school_type',
        'school_level',
        'school_name',
        'student_id',
        'gpa',
    ];

    /**
     * Get the user that owns the student profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the scholarship applications for the student profile.
     */
    public function scholarshipApplications(): HasMany
    {
        return $this->hasMany(ScholarshipApplication::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => 'string',
            'school_type' => 'string',
            'student_id' => 'string',
            'gpa' => 'float',
        ];
    }
}
