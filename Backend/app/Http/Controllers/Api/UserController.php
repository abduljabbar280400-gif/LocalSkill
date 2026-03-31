<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Check username availability
     * GET /api/check-username?username=john_doe
     */
    public function checkUsername(Request $request)
    {
        $request->validate([
            'username' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-zA-Z0-9_]+$/'
            ],
        ]);

        $username = strtolower($request->username);

        $exists = User::withTrashed()
            ->whereRaw('LOWER(username) = ?', [$username])
            ->exists();

        if ($exists) {
            return response()->json([
                'available' => false,
                'message' => 'username already taken',
            ]);
        }

        return response()->json([
            'available' => true,
        ]);
    }

    public function checkEmail(Request $request)
{
    $request->validate([
        'email' => 'required|email',
    ]);

    $exists = User::where('email', strtolower($request->email))->exists();

    return response()->json([
        'available' => ! $exists,
    ]);
}
public function checkPhone(Request $request)
{
    $request->validate([
        'phone' => 'required|string',
    ]);

    $phone = preg_replace('/[^0-9+]/', '', $request->phone);

if (!str_starts_with($phone, '+')) {
    $phone = '+91' . ltrim($phone, '0');
}

$exists = User::where('phone', $phone)->exists();


    return response()->json([
        'available' => ! $exists,
    ]);
}

}
