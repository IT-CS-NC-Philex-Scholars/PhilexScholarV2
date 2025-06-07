<?php

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
        Schema::table('student_profiles', function (Blueprint $table) {
            // Make user_id nullable. Note: existing foreign key constraints might need handling.
            // $table->dropForeign(['user_id']); // If direct change causes issues
            $table->unsignedBigInteger('user_id')->nullable()->change();
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade'); // Re-add if dropped

            $table->string('email')->nullable()->unique()->after('user_id');
            $table->enum('status', ['unclaimed', 'claimed', 'archived'])->default('unclaimed')->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            // Revert user_id to not nullable. This assumes that if rolled back,
            // all student_profiles should have a user_id. Consider implications.
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->dropColumn(['email', 'status']);
        });
    }
};
