<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Contract;

class ReviewController extends Controller
{
    public function store(Request $request, $username, $contractId)
    {
        // dd($request->all());
        $user = $request->user();

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review_comment' => 'nullable|string|max:2000',
        ]);

        $contract = Contract::findOrFail($contractId);

        // Ensure client is reviewing
        if ($contract->client_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // Ensure contract is completed
        if ($contract->status !== 'completed') {
            return response()->json([
                'message' => 'Contract must be completed before reviewing.'
            ], 400);
        }

        // Prevent duplicate review
        $exists = Review::where('contract_id', $contractId)->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Review already submitted.'
            ], 400);
        }

        $review = Review::create([
            'contract_id' => $contract->id,
            'project_id' => $contract->project_id,
            'client_id' => $contract->client_id,
            'freelancer_id' => $contract->freelancer_id,
            'rating' => $request->rating,
            'review_comment' => $request->review_comment,
        ]);

         $averageRating = Review::where('freelancer_id', $contract->freelancer_id)
        ->avg('rating');

    $totalReviews = Review::where('freelancer_id', $contract->freelancer_id)
        ->count();

    $completedJobs = Contract::where('freelancer_id', $contract->freelancer_id)
        ->where('status', 'completed')
        ->count();

        \DB::table('freelancer_profiles')
        ->where('user_id', $contract->freelancer_id)
        ->update([
            'average_rating' => round($averageRating, 2),
            'total_reviews' => $totalReviews,
            'completed_jobs' => $completedJobs,
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'review' => $review
        ]);
    }
}