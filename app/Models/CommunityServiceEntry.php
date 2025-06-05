<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $scholarship_application_id
 * @property \Illuminate\Support\Carbon $service_date
 * @property string $time_in
 * @property string|null $time_out
 * @property string $task_description
 * @property string|null $lessons_learned
 * @property array|null $photos
 * @property float $hours_completed
 * @property string $status
 * @property string|null $admin_notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read ScholarshipApplication $scholarshipApplication
 */
final class CommunityServiceEntry extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'scholarship_application_id',
        'service_date',
        'time_in',
        'time_out',
        'task_description',
        'lessons_learned',
        'photos',
        'hours_completed',
        'status',
        'admin_notes',
    ];

    /**
     * Get the scholarship application that owns the community service entry.
     */
    public function scholarshipApplication(): BelongsTo
    {
        return $this->belongsTo(ScholarshipApplication::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'service_date' => 'date:Y-m-d',
            'photos' => 'array',
            'hours_completed' => 'decimal:2',
        ];
    }
}
