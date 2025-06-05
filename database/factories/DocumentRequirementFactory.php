<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ScholarshipProgram;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DocumentRequirement>
 */
final class DocumentRequirementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $documentTypes = [
            'Transcript',
            'Letter of Recommendation',
            'Personal Statement',
            'Financial Aid Form',
            'Tax Returns',
            'Birth Certificate',
            'Proof of Enrollment',
            'Income Verification',
        ];

        return [
            'scholarship_program_id' => ScholarshipProgram::factory(),
            'name' => $this->faker->randomElement($documentTypes),
            'description' => $this->faker->sentence(),
            'is_required' => $this->faker->boolean(70), // 70% chance of being required
        ];
    }
}
