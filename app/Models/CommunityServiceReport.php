<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $scholarship_application_id
 * @property string $description
 * @property int $days_completed
 * @property string $status
 * @property string|null $rejection_reason
 * @property \Illuminate\Support\Carbon $submitted_at
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\ScholarshipApplication $scholarshipApplication
 */
final class CommunityServiceReport extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'scholarship_application_id',
        'description',
        'days_completed',
        'status',
        'rejection_reason',
        'submitted_at',
        'reviewed_at',
    ];
    
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'days_completed' => 'integer',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }
    
    /**
     * Get the scholarship application that owns the community service report.
     */
    public function scholarshipApplication(): BelongsTo
    {
        return $this->belongsTo(ScholarshipApplication::class);
    }
}