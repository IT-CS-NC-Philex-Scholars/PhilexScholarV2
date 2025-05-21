<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $address
 * @property string $city
 * @property string $state
 * @property string $zip_code
 * @property string $phone_number
 * @property string $school_type
 * @property string $school_level
 * @property string $school_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ScholarshipApplication> $scholarshipApplications
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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'school_type' => 'string',
            'student_id' => 'string',
            'gpa' => 'float',
        ];
    }
    
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
}