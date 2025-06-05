<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $scholarship_program_id
 * @property string $name
 * @property string $description
 * @property bool $is_required
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read ScholarshipProgram $scholarshipProgram
 * @property-read \Illuminate\Database\Eloquent\Collection<int, DocumentUpload> $documentUploads
 */
final class DocumentRequirement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'scholarship_program_id',
        'name',
        'description',
        'is_required',
    ];

    /**
     * Get the scholarship program that owns the document requirement.
     */
    public function scholarshipProgram(): BelongsTo
    {
        return $this->belongsTo(ScholarshipProgram::class);
    }

    /**
     * Get the document uploads for the document requirement.
     */
    public function documentUploads(): HasMany
    {
        return $this->hasMany(DocumentUpload::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
        ];
    }
}
