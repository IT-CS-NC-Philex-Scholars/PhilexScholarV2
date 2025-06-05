<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StudentProfile>
 */
final class StudentProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->stateAbbr(),
            'zip_code' => $this->faker->postcode(),
            'phone_number' => $this->faker->phoneNumber(),
            'school_type' => $this->faker->randomElement(['high_school', 'college']),
            'school_level' => $this->faker->randomElement(['Freshman', 'Sophomore', 'Junior', 'Senior']),
            'school_name' => $this->faker->company().' University',
            'student_id' => 'S'.$this->faker->unique()->numerify('#####'),
            'gpa' => $this->faker->randomFloat(2, 2.0, 4.0),
        ];
    }
}
