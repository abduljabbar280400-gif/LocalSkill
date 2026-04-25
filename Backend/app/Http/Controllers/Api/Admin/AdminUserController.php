<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status', 'all');
        $role = $request->query('role');

        $query = User::with('freelancerProfile')
            ->when($role, function($q) use ($role) {
                return $q->where('role', $role);
            })
            ->select(
                'id',
                'public_user_code',
                'username',
                'email',
                'role',
                'title',
                'first_name',
                'last_name',
                'is_active',
                'is_suspended',
                'suspended_reason',
                'last_seen',
                'created_at'
            );

        // Server-side Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('public_user_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        // Server-side Filtering
        if ($status === 'verified') {
            $query->whereHas('freelancerProfile', function($q) {
                $q->where('profile_approved', true);
            });
        } elseif ($status === 'suspended') {
            $query->where('is_suspended', true);
        } elseif ($status === 'active') {
            $query->where('last_seen', '>=', now()->subDay());
        } elseif ($status === 'inactive') {
            $query->where(function($q) {
                $q->where('last_seen', '<', now()->subDay())
                  ->orWhereNull('last_seen');
            });
        }

        $users = $query->latest()->paginate(25);

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

    // 🔒 If user is a freelancer, hide their public profile
    if ($user->role === 'freelancer' && $user->freelancerProfile) {
        $user->freelancerProfile->update([
            'profile_visibility' => 'hidden'
        ]);
    }

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
