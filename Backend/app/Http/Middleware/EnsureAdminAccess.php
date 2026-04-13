<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdminAccess
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized access'
            ], 403);
        }

        if ($user->is_suspended) {
            return response()->json([
                'message' => 'Your account is suspended'
            ], 403);
        }

        return $next($request);
    }
}