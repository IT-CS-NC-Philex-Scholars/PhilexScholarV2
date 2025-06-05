<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $student_profile_id
 * @property int $scholarship_program_id
 * @property string $status
 * @property string|null $admin_notes
 * @property \Illuminate\Support\Carbon|null $submitted_at
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read StudentProfile $studentProfile
 * @property-read ScholarshipProgram $scholarshipProgram
 * @property-read \Illuminate\Database\Eloquent\Collection<int, DocumentUpload> $documentUploads
 * @property-read \Illuminate\Database\Eloquent\Collection<int, CommunityServiceReport> $communityServiceReports
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Disbursement> $disbursements
 */
final class ScholarshipApplication extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'student_profile_id',
        'scholarship_program_id',
        'status',
        'admin_notes',
        'submitted_at',
        'reviewed_at',
    ];

    /**
     * Get the student profile that owns the scholarship application.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    /**
     * Get the scholarship program that owns the scholarship application.
     */
    public function scholarshipProgram(): BelongsTo
    {
        return $this->belongsTo(ScholarshipProgram::class);
    }

    /**
     * Get the document uploads for the scholarship application.
     */
    public function documentUploads(): HasMany
    {
        return $this->hasMany(DocumentUpload::class);
    }

    /**
     * Get the community service reports for the scholarship application.
     */
    public function communityServiceReports(): HasMany
    {
        return $this->hasMany(CommunityServiceReport::class);
    }

    /**
     * Get the disbursements for the scholarship application.
     */
    public function disbursements(): HasMany
    {
        return $this->hasMany(Disbursement::class);
    }

    /**
     * Get the community service entries for the scholarship application.
     */
    public function communityServiceEntries(): HasMany
    {
        return $this->hasMany(CommunityServiceEntry::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }
}
