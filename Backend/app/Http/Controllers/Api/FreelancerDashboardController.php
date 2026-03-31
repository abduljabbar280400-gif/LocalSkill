<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FreelancerProfile;

class FreelancerDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $profile = FreelancerProfile::where('user_id', $user->id)->first();

        return response()->json([
            'user' => [
                'username'   => $user->username,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
            ],
            'stats' => $profile ? [
                'average_rating' => $profile->average_rating,
                'total_reviews'  => $profile->total_reviews,
                'completed_jobs' => $profile->completed_jobs,
            ] : null,
        ]);
    }
}
