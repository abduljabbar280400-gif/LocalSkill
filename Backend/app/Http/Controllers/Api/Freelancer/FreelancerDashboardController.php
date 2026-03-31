<?php

namespace App\Http\Controllers\Api\Freelancer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Review;
use App\Models\Contract;

class FreelancerDashboardController extends Controller
{
    public function index(Request $request, $username)
    {
        $user = $request->user();

        if (!$user || $user->username !== $username) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $freelancerId = $user->id;

        /*
        |--------------------------------------------------------------------------
        | Average Rating
        |--------------------------------------------------------------------------
        */

        $averageRating = Review::where('freelancer_id', $freelancerId)
            ->avg('rating');

        /*
        |--------------------------------------------------------------------------
        | Total Reviews
        |--------------------------------------------------------------------------
        */

        $totalReviews = Review::where('freelancer_id', $freelancerId)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Completed Jobs
        |--------------------------------------------------------------------------
        */

        $completedJobs = Contract::where('freelancer_id', $freelancerId)
            ->where('status', 'completed')
            ->count();

        return response()->json([
            'stats' => [
                'average_rating' => $averageRating ? round($averageRating, 1) : 0,
                'total_reviews' => $totalReviews,
                'completed_jobs' => $completedJobs,
            ]
        ]);
    }
}