<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

class PublicUserCodeGenerator
{
    /**
     * Generate a unique public user code like #2UCOP23
     */
    public static function generate(): string
    {
        do {
            $code = '#' . strtoupper(Str::random(7));
        } while (User::where('public_user_code', $code)->exists());

        return $code;
    }

    /**
     * Check if code already exists
     */
    // protected static function exists(string $code): bool
    // {
    //     return User::where('public_user_code', $code)->exists();
    // }
}
