<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CommunityServiceReport;
use App\Models\ScholarshipApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CommunityServiceReport>
 */
final class CommunityServiceReportFactory extends Factory
{
    protected $model = CommunityServiceReport::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'scholarship_application_id' => ScholarshipApplication::factory(),
            'description' => $this->faker->paragraph(),
            'pdf_report_path' => null,
            'report_type' => $this->faker->randomElement(['tracked', 'pdf_upload']),
            'total_hours' => $this->faker->numberBetween(10, 100),
            'days_completed' => $this->faker->numberBetween(1, 30),
            'status' => $this->faker->randomElement(['pending_review', 'approved', 'rejected_insufficient_hours', 'rejected_incomplete_documentation', 'rejected_other']),
            'rejection_reason' => null,
            'submitted_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'reviewed_at' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'approved',
            'reviewed_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'rejected_other',
            'rejection_reason' => $this->faker->sentence(),
            'reviewed_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'pending_review',
            'reviewed_at' => null,
        ]);
    }
}
