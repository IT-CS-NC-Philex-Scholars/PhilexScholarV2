<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $description
 * @property float $total_budget
 * @property float $per_student_budget
 * @property int $available_slots
 * @property string $school_type_eligibility
 * @property float $min_gpa
 * @property int|null $min_units
 * @property string $semester
 * @property string $academic_year
 * @property \Illuminate\Support\Carbon $application_deadline
 * @property int $community_service_days
 * @property bool $active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, ScholarshipApplication> $scholarshipApplications
 * @property-read \Illuminate\Database\Eloquent\Collection<int, DocumentRequirement> $documentRequirements
 */
final class ScholarshipProgram extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'total_budget',
        'per_student_budget',
        'available_slots',
        'school_type_eligibility',
        'min_gpa',
        'min_units',
        'semester',
        'academic_year',
        'application_deadline',
        'community_service_days',
        'active',
    ];

    /**
     * Get the scholarship applications for the scholarship program.
     */
    public function scholarshipApplications(): HasMany
    {
        return $this->hasMany(ScholarshipApplication::class);
    }

    /**
     * Get the document requirements for the scholarship program.
     */
    public function documentRequirements(): HasMany
    {
        return $this->hasMany(DocumentRequirement::class);
    }

    /**
     * Get the remaining slots for the scholarship program.
     */
    public function getRemainingSlots(): int
    {
        $usedSlots = $this->scholarshipApplications()
            ->whereIn('status', ['approved', 'enrolled'])
            ->count();

        return $this->available_slots - $usedSlots;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_budget' => 'decimal:2',
            'per_student_budget' => 'decimal:2',
            'min_gpa' => 'decimal:2',
            'application_deadline' => 'date',
            'active' => 'boolean',
        ];
    }
}
