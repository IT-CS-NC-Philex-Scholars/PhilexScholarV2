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
        // This will recreate the table without the generated column
        Schema::table('scholarship_programs', function (Blueprint $table): void {
            if (Schema::hasColumn('scholarship_programs', 'available_slots')) {
                $table->dropColumn('available_slots');
            }
        });

        Schema::table('scholarship_programs', function (Blueprint $table): void {
            $table->integer('available_slots')->nullable()->after('per_student_budget');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scholarship_programs', function (Blueprint $table): void {
            //
        });
    }
};
