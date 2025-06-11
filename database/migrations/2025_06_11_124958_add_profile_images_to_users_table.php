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
            $table->string('avatar')->nullable()->after('email_verified_at');
            $table->string('cover_image')->nullable()->after('avatar');
            $table->string('facebook_avatar')->nullable()->after('cover_image');
            $table->string('facebook_profile_url')->nullable()->after('facebook_avatar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'cover_image', 'facebook_avatar', 'facebook_profile_url']);
        });
    }
};
