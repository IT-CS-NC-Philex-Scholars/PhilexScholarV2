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
        Schema::create('community_service_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('scholarship_application_id')->constrained()->cascadeOnDelete();
            $table->date('service_date');
            $table->time('time_in');
            $table->time('time_out')->nullable();
            $table->text('task_description');
            $table->text('lessons_learned')->nullable();
            $table->json('photos')->nullable(); // Array of photo file paths
            $table->decimal('hours_completed', 4, 2)->default(0);
            $table->enum('status', ['in_progress', 'completed', 'approved', 'rejected'])->default('in_progress');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_service_entries');
    }
};
