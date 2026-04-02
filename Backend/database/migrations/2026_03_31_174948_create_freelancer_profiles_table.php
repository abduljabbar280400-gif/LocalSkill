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
        Schema::create('freelancer_profiles', function (Blueprint $table) {
    $table->id();

    $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
    $table->foreignId('primary_category_id')->nullable()->constrained('categories')->nullOnDelete();

    $table->string('professional_title');
    $table->text('bio')->nullable();

    $table->enum('experience_level', ['student','beginner','intermediate','advanced']);

    $table->boolean('skills_completed')->default(false);

    $table->decimal('hourly_rate', 8, 2)->nullable();
    $table->string('currency', 3)->default('GBP');

    $table->enum('preferred_work_type', ['remote','local','both'])->nullable();
    $table->enum('availability_status', ['available','busy','unavailable'])->default('available');

    $table->integer('max_hours_per_week')->nullable();

    $table->string('city')->nullable();
    $table->string('postcode')->nullable();

    $table->decimal('latitude', 9, 6)->nullable();
    $table->decimal('longitude', 9, 6)->nullable();

    $table->integer('search_radius_km')->nullable();

    $table->enum('profile_visibility', ['visible','hidden'])->default('hidden');

    $table->boolean('onboarding_completed')->default(false);

    $table->decimal('average_rating', 3, 2)->default(0);
    $table->integer('total_reviews')->default(0);
    $table->integer('completed_jobs')->default(0);

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('freelancer_profiles');
    }
};
