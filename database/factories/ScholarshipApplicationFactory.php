<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ScholarshipProgram;
use App\Models\StudentProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ScholarshipApplication>
 */
final class ScholarshipApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = [
            'submitted',
            'documents_pending',
            'documents_under_review',
            'documents_approved',
            'documents_rejected',
            'eligibility_verified',
            'enrolled',
            'service_pending',
            'service_completed',
            'disbursement_pending',
            'disbursement_processed',
            'completed',
            'rejected',
        ];

        return [
            'student_profile_id' => StudentProfile::factory(),
            'scholarship_program_id' => ScholarshipProgram::factory(),
            'status' => $this->faker->randomElement($statuses),
            'admin_notes' => $this->faker->optional(0.7)->paragraph(),
            'submitted_at' => $this->faker->optional(0.9)->dateTimeBetween('-3 months', 'now'),
            'reviewed_at' => $this->faker->optional(0.6)->dateTimeBetween('-2 months', 'now'),
        ];
    }

    /**
     * Set the application status to submitted.
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'submitted',
            'submitted_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'reviewed_at' => null,
        ]);
    }

    /**
     * Set the application status to approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => $this->faker->randomElement([
                'documents_approved',
                'eligibility_verified',
                'enrolled',
                'service_pending',
                'service_completed',
                'disbursement_pending',
            ]),
            'submitted_at' => $this->faker->dateTimeBetween('-3 months', '-1 month'),
            'reviewed_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Set the application status to completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'completed',
            'submitted_at' => $this->faker->dateTimeBetween('-6 months', '-3 months'),
            'reviewed_at' => $this->faker->dateTimeBetween('-3 months', '-1 month'),
        ]);
    }

    /**
     * Set the application status to rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => $this->faker->randomElement([
                'documents_rejected',
                'rejected',
            ]),
            'submitted_at' => $this->faker->dateTimeBetween('-3 months', '-1 week'),
            'reviewed_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'admin_notes' => $this->faker->paragraph(),
        ]);
    }
}
