<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;

class AdminUserController extends Controller
{
    public function index()
{
    $users = User::with('freelancerProfile')
    ->select(
        'id',
        'public_user_code',
        'username',
        'email',
        'role',
        'is_active',
        'is_suspended',
        'created_at'
    )
    ->latest()
    ->paginate(20);

    return response()->json($users);
}
public function suspend(Request $request, $id)
{
    $request->validate([
        'reason' => 'required|string|max:500'
    ]);

    $user = User::findOrFail($id);

    // ❗ Prevent admin self suspend
    if ($user->id === auth()->id()) {
        return response()->json([
            'message' => 'You cannot suspend yourself'
        ], 400);
    }

    $user->update([
        'is_suspended' => true,
        'suspended_reason' => $request->reason
    ]);

    return response()->json([
        'message' => 'User suspended successfully'
    ]);
}
public function unsuspend($id)
{
    $user = User::findOrFail($id);

    $user->update([
        'is_suspended' => false,
        'suspended_reason' => null
    ]);

    return response()->json([
        'message' => 'User unsuspended successfully'
    ]);
}
}
