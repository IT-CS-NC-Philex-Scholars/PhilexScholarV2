<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $scholarship_application_id
 * @property int $document_requirement_id
 * @property string $file_path
 * @property string $original_filename
 * @property string $status
 * @property string|null $rejection_reason
 * @property \Illuminate\Support\Carbon $uploaded_at
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read ScholarshipApplication $scholarshipApplication
 * @property-read DocumentRequirement $documentRequirement
 */
final class DocumentUpload extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'scholarship_application_id',
        'document_requirement_id',
        'file_path',
        'original_filename',
        'status',
        'rejection_reason',
        'uploaded_at',
        'reviewed_at',
    ];

    /**
     * Get the scholarship application that owns the document upload.
     */
    public function scholarshipApplication(): BelongsTo
    {
        return $this->belongsTo(ScholarshipApplication::class);
    }

    /**
     * Get the document requirement that owns the document upload.
     */
    public function documentRequirement(): BelongsTo
    {
        return $this->belongsTo(DocumentRequirement::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }
}
