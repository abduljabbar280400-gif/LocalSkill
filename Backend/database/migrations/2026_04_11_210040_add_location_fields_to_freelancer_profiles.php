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
    Schema::table('freelancer_profiles', function (Blueprint $table) {

        // 🌍 Location
        $table->string('country', 100)->nullable()->after('city');
        $table->string('state', 100)->nullable()->after('country');

        // 🏠 Address
        $table->string('street_address', 255)->nullable()->after('state');
        $table->string('landmark', 255)->nullable()->after('street_address');

        // 🗣 Languages (PostgreSQL array)
        $table->text('languages')->nullable()->after('landmark');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('freelancer_profiles', function (Blueprint $table) {
            //
        });
    }
};
