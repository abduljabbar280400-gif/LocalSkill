<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->is_suspended) {
            return response()->json([
                'message' => 'Account suspended: ' . $user->suspended_reason
            ], 403);
        }

        return $next($request);
    }
}