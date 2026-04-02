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
        Schema::create('freelancer_skills', function (Blueprint $table) {
    $table->id();

    $table->foreignId('freelancer_profile_id')
          ->constrained()
          ->cascadeOnDelete();

    $table->foreignId('skill_id')
          ->constrained()
          ->cascadeOnDelete();

    $table->integer('experience_years')->nullable();
    $table->boolean('is_primary')->default(false);

    $table->timestamps();

    $table->unique(['freelancer_profile_id', 'skill_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('freelancer_skills');
    }
};
