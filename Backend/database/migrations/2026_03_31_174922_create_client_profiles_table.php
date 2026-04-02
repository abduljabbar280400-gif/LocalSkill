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
        Schema::create('client_profiles', function (Blueprint $table) {
    $table->id();

    $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();

    $table->string('company_name')->nullable();
    $table->string('company_website')->nullable();

    $table->string('industry')->nullable();
    $table->string('company_size')->nullable();

    $table->text('description')->nullable();

    $table->string('state')->nullable();
    $table->string('city')->nullable();
    $table->string('postcode')->nullable();

    $table->decimal('latitude', 10, 8)->nullable();
    $table->decimal('longitude', 11, 8)->nullable();

    $table->boolean('is_verified')->default(false);
    $table->boolean('is_profile_completed')->default(false);

    $table->softDeletes();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_profiles');
    }
};
