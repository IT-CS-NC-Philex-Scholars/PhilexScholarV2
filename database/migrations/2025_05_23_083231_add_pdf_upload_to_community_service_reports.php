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
        Schema::table('community_service_reports', function (Blueprint $table): void {
            $table->string('pdf_report_path')->nullable()->after('description');
            $table->enum('report_type', ['tracked', 'pdf_upload'])->default('tracked')->after('pdf_report_path');
            $table->decimal('total_hours', 6, 2)->default(0)->after('days_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('community_service_reports', function (Blueprint $table): void {
            $table->dropColumn(['pdf_report_path', 'report_type', 'total_hours']);
        });
    }
};
