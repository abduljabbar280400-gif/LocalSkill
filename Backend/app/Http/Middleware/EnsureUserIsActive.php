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
            // Allow suspended users to see their own profile info/dashboard to know why they are suspended
            if ($request->is('api/freelancer/*/my-profile') || 
                $request->is('api/freelancer/*/edit-profile') ||
                $request->is('api/freelancer/*/dashboard') ||
                $request->is('api/freelancer/*/earnings') ||
                $request->is('api/freelancer/logout')) {
                return $next($request);
            }

            return response()->json([
                'message' => 'Account suspended: ' . $user->suspended_reason
            ], 403);
        }

        return $next($request);
    }
}