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
        Schema::create('payments', function (Blueprint $table) {
    $table->id();

    $table->foreignId('contract_id')->constrained()->cascadeOnDelete();

    $table->decimal('amount', 12, 2);

    $table->enum('payment_status', ['pending','paid','failed','refunded','escrowed','released'])->default('pending');

    $table->string('transaction_reference')->nullable();

    $table->decimal('platform_fee', 12, 2)->nullable();
    $table->decimal('platform_fee_percent', 5, 2)->default(10);

    $table->decimal('freelancer_earnings', 12, 2)->nullable();

    $table->string('escrow_status')->default('held');
    $table->string('freelancer_payout_status')->default('pending');

    $table->timestamp('paid_at')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
