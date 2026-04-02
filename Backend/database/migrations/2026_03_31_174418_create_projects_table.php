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
        Schema::create('projects', function (Blueprint $table) {
    $table->id();

    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('category_id')->constrained()->restrictOnDelete();

    $table->string('title');
    $table->text('description');

    $table->decimal('budget_min', 12, 2)->nullable();
    $table->decimal('budget_max', 12, 2)->nullable();

    $table->enum('budget_type', ['fixed','hourly']);
    $table->enum('experience_level', ['student','beginner','intermediate','advanced']);

    $table->string('duration')->nullable();

    $table->enum('status', ['closed','open','in_progress','completed','cancelled'])->default('open');

    $table->boolean('is_active')->default(true);

    $table->string('slug')->nullable()->unique();

    $table->string('location')->nullable();
    $table->decimal('latitude', 10, 8)->nullable();
    $table->decimal('longitude', 11, 8)->nullable();

    $table->date('deadline')->nullable();

    $table->string('postal_code')->nullable();
    $table->string('preferred_work_type')->default('both');
    $table->string('location_type')->default('profile');

    $table->softDeletes();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
