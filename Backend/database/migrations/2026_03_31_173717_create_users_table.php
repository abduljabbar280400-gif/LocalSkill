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
        Schema::create('users', function (Blueprint $table) {
    $table->id();

    $table->string('public_user_code', 10)->unique();
    $table->string('username', 50)->unique();

    $table->enum('title', ['Mr','Mrs','Ms','Dr']);

    $table->string('first_name');
    $table->string('last_name');

    $table->string('email')->unique();
    $table->string('phone')->nullable();

    $table->text('password');

    $table->boolean('is_active')->default(true);
    $table->boolean('is_suspended')->default(false);

    $table->text('suspended_reason')->nullable();

    $table->date('dob')->nullable();

    $table->enum('role', ['super_admin','admin','freelancer','client'])->default('freelancer');

    $table->timestamp('last_seen')->nullable();

    $table->softDeletes();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
