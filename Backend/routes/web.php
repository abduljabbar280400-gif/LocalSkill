<?php

use Illuminate\Support\Facades\DB;
Route::get('/test-insert', function () {
    try {
        DB::table('users')->insert([
            'id' => '1',
            'public_user_code' => '#TEST123',
            'username' => 'test_user',
            'title' => 'Mr',
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '22222222',
            'password' => '$2y$12$VHwYg6lZRHJTISSDDbC8ye8ZwAJTg406NGSIr2ymYKEjeF4F.k1Zm',
            'is_active' => true,
            'is_suspended' => false,
            'role' => 'freelancer',

            'created_at' => now(),
            'updated_at' => now()
        ]);

        return "Insert successful ✅";
    } catch (\Exception $e) {
        return "Insert failed ❌ " . $e->getMessage();
    }
});