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
        Schema::create('scholarship_applications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('scholarship_program_id')->constrained()->cascadeOnDelete();
            $table->enum('status', [
                'draft',
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
            ])->default('draft');
            $table->text('admin_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarship_applications');
    }
};
