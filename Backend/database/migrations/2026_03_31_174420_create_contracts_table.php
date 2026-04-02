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
       Schema::create('contracts', function (Blueprint $table) {
    $table->id();

    $table->foreignId('project_id')->constrained()->cascadeOnDelete();
    $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
    $table->foreignId('freelancer_id')->constrained('users')->cascadeOnDelete();
    $table->foreignId('proposal_id')->constrained()->cascadeOnDelete();

    $table->decimal('agreed_amount', 12, 2);

    $table->date('start_date');
    $table->date('end_date')->nullable();

    $table->enum('status', ['active','completed','terminated','pending','submitted'])->default('pending');

    $table->string('contract_number')->unique()->nullable();

    $table->decimal('platform_fee_percent', 5, 2)->default(10);

    $table->decimal('total_paid', 12, 2)->default(0);

    $table->enum('payment_status', ['pending','partial','paid','refunded','funded'])->default('pending');

    $table->timestamps();

    $table->unique(['project_id','freelancer_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
