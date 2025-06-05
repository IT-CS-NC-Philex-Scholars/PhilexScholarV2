<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ScholarshipProgram>
 */
final class ScholarshipProgramFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $perStudentBudget = $this->faker->randomElement([1000, 2000, 2500, 3000, 5000, 10000]);
        $totalSlots = $this->faker->numberBetween(5, 50);

        $semesters = ['Fall', 'Spring', 'Summer'];
        $currentYear = date('Y');
        $years = [$currentYear, $currentYear + 1];
        $academicYear = $this->faker->randomElement($years).'-'.($this->faker->randomElement($years) + 1);

        return [
            'name' => $this->faker->words(3, true).' Scholarship',
            'description' => $this->faker->paragraph(),
            'total_budget' => $perStudentBudget * $totalSlots,
            'per_student_budget' => $perStudentBudget,
            'available_slots' => $totalSlots,
            'school_type_eligibility' => $this->faker->randomElement(['high_school', 'college', 'both']),
            'min_gpa' => $this->faker->randomFloat(1, 2.0, 3.5),
            'min_units' => $this->faker->optional(0.7)->numberBetween(6, 12),
            'semester' => $this->faker->randomElement($semesters),
            'academic_year' => $academicYear,
            'application_deadline' => $this->faker->dateTimeBetween('+1 month', '+6 months'),
            'community_service_days' => $this->faker->numberBetween(0, 10),
            'active' => $this->faker->boolean(80),
        ];
    }

    /**
     * Set the scholarship program to active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes): array => [
            'active' => true,
        ]);
    }

    /**
     * Set the scholarship program to inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'active' => false,
        ]);
    }
}
