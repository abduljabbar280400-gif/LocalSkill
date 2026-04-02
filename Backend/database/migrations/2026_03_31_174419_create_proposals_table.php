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
        Schema::create('proposals', function (Blueprint $table) {
    $table->id();

    $table->foreignId('project_id')->constrained()->cascadeOnDelete();
    $table->foreignId('freelancer_id')->constrained('users')->cascadeOnDelete();

    $table->text('cover_letter');

    $table->decimal('proposed_amount', 12, 2);
    $table->string('estimated_duration')->nullable();

    $table->enum('status', ['pending','shortlisted','accepted','rejected','withdrawn'])->default('pending');

    $table->string('attachment_file')->nullable();
    $table->text('attachment_link')->nullable();

    $table->timestamps();

    $table->unique(['project_id','freelancer_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
