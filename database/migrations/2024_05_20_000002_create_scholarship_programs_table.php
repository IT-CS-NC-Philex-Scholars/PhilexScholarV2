<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('scholarship_programs', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->decimal('total_budget', 12, 2);
            $table->decimal('per_student_budget', 8, 2);
            $table->integer('available_slots')->storedAs('FLOOR(total_budget / per_student_budget)');
            $table->enum('school_type_eligibility', ['high_school', 'college', 'both']);
            $table->decimal('min_gpa', 5, 2);
            $table->integer('min_units')->nullable(); // Only applicable for college
            $table->string('semester');
            $table->string('academic_year');
            $table->date('application_deadline');
            $table->integer('community_service_days')->default(6);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarship_programs');
    }
};
