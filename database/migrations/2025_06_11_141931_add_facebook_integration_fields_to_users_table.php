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
        Schema::table('users', function (Blueprint $table) {
            $table->string('facebook_id')->nullable()->after('facebook_profile_url');
            $table->string('provider')->nullable()->after('facebook_id'); // oauth provider (facebook, google, etc.)
            $table->string('provider_id')->nullable()->after('provider'); // provider specific ID
            $table->json('provider_data')->nullable()->after('provider_id'); // additional provider data
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'facebook_id',
                'provider',
                'provider_id',
                'provider_data'
            ]);
        });
    }
};
