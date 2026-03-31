<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class FreelancerController extends Controller
{
    public function topFreelancers()
    {
        $freelancers = DB::table('freelancer_profiles')
            ->join('users', 'freelancer_profiles.user_id', '=', 'users.id')
            ->select(
                'users.id',
                'users.first_name',
                'users.last_name',
                'freelancer_profiles.average_rating',
                'freelancer_profiles.completed_jobs',
            )
            ->orderByDesc('freelancer_profiles.average_rating')
            ->orderByDesc('freelancer_profiles.completed_jobs')
            ->limit(3)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $freelancers
        ]);
    }
}