<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\DocumentRequirement;
use App\Models\ScholarshipApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DocumentUpload>
 */
final class DocumentUploadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = [
            'pending_review',
            'approved',
            'rejected_invalid',
            'rejected_incomplete',
            'rejected_incorrect_format',
            'rejected_unreadable',
            'rejected_other',
        ];

        $extensions = ['pdf', 'doc', 'docx', 'jpg', 'png'];
        $extension = $this->faker->randomElement($extensions);
        $filename = $this->faker->word().'.'.$extension;

        return [
            'scholarship_application_id' => ScholarshipApplication::factory(),
            'document_requirement_id' => DocumentRequirement::factory(),
            'file_path' => 'uploads/documents/'.$filename,
            'original_filename' => $filename,
            'status' => $this->faker->randomElement($statuses),
            'rejection_reason' => $this->faker->optional(0.3)->sentence(),
            'uploaded_at' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'reviewed_at' => $this->faker->optional(0.7)->dateTimeBetween('-2 months', 'now'),
        ];
    }
}
