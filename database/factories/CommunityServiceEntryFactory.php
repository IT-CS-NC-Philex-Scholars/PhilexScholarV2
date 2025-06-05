<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CommunityServiceEntry;
use App\Models\ScholarshipApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CommunityServiceEntry>
 */
final class CommunityServiceEntryFactory extends Factory
{
    protected $model = CommunityServiceEntry::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $serviceDate = $this->faker->dateTimeBetween('-60 days', '-1 day');
        $timeIn = $this->faker->time('H:i:s', '16:00:00');
        $timeOut = $this->faker->time('H:i:s', '20:00:00');

        return [
            'scholarship_application_id' => ScholarshipApplication::factory(),
            'service_date' => $serviceDate,
            'time_in' => $timeIn,
            'time_out' => $timeOut,
            'hours_completed' => $this->faker->randomFloat(2, 2, 8),
            'organization_name' => $this->faker->company(),
            'organization_contact' => $this->faker->name(),
            'organization_phone' => $this->faker->phoneNumber(),
            'service_description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['in_progress', 'completed', 'approved', 'rejected']),
            'photos' => [],
            'admin_notes' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'approved',
            'admin_notes' => $this->faker->sentence(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'rejected',
            'admin_notes' => $this->faker->sentence(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'completed',
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'in_progress',
            'time_out' => null,
            'hours_completed' => null,
        ]);
    }
}
