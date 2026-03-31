<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {

            // 1️⃣ Add slug (NOT NULL since table is empty)
            $table->string('slug', 255)->after('title');
            $table->unique('slug');

            // 2️⃣ Add location
            $table->string('location', 255)->nullable()->after('duration');

            // 3️⃣ Add latitude & longitude
            $table->decimal('latitude', 10, 8)->nullable()->after('location');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');

            // 4️⃣ Add deadline
            $table->date('deadline')->nullable()->after('longitude');

            // 5️⃣ Add soft deletes
            $table->softDeletes();

            // 6️⃣ Remove is_active
            $table->dropColumn('is_active');
            // Add Slug 
            $table->string('slug')->unique();
        });

        // 7️⃣ Change default enum value to 'open'
        DB::statement("ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'open'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'closed'");

        Schema::table('projects', function (Blueprint $table) {

            $table->boolean('is_active')->default(true);

            $table->dropUnique(['slug']);

            $table->dropColumn([
                'slug',
                'location',
                'latitude',
                'longitude',
                'deadline',
                'deleted_at'
            ]);
        });
    }
};