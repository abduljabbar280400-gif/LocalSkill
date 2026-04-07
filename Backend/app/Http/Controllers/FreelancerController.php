<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FreelancerController extends Controller
{
    /**
     * GET /api/freelancers
     */
    public function index(Request $request)
    {
        $query = DB::table('freelancer_profiles')
            ->join('users', 'freelancer_profiles.user_id', '=', 'users.id')
            ->leftJoin('freelancer_skills', 'freelancer_profiles.id', '=', 'freelancer_skills.freelancer_profile_id')
            ->leftJoin('skills', 'freelancer_skills.skill_id', '=', 'skills.id')
            ->where('users.role', 'freelancer')
            ->where('freelancer_profiles.profile_visibility', 'public')
            ->where('freelancer_profiles.onboarding_completed', true)
            ->select(
                'users.id',
                'users.username',
                'users.first_name',
                'users.last_name',
                'freelancer_profiles.professional_title',
                'freelancer_profiles.bio',
                'freelancer_profiles.experience_level',
                'freelancer_profiles.hourly_rate',
                'freelancer_profiles.currency',
                'freelancer_profiles.average_rating',
                'freelancer_profiles.total_reviews',
                'freelancer_profiles.availability_status',
                DB::raw('ARRAY_AGG(DISTINCT skills.name) as skills')
            )
            ->groupBy(
                'users.id',
                'users.username',
                'users.first_name',
                'users.last_name',
                'freelancer_profiles.professional_title',
                'freelancer_profiles.bio',
                'freelancer_profiles.experience_level',
                'freelancer_profiles.hourly_rate',
                'freelancer_profiles.currency',
                'freelancer_profiles.average_rating',
                'freelancer_profiles.total_reviews',
                'freelancer_profiles.availability_status'
            );

        /**
         * 🔍 Search (name + title)
         */
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('users.first_name', 'ILIKE', '%' . $request->search . '%')
                  ->orWhere('users.last_name', 'ILIKE', '%' . $request->search . '%')
                  ->orWhere('freelancer_profiles.professional_title', 'ILIKE', '%' . $request->search . '%');
            });
        }

        /**
         * 🎯 Filter by experience
         */
        if ($request->experience) {
            $query->where('freelancer_profiles.experience_level', $request->experience);
        }

        /**
         * 💰 Rate filtering
         */
        if ($request->min_rate) {
            $query->where('freelancer_profiles.hourly_rate', '>=', $request->min_rate);
        }

        if ($request->max_rate) {
            $query->where('freelancer_profiles.hourly_rate', '<=', $request->max_rate);
        }

        /**
         * 🧠 Filter by skills
         */
        if ($request->skills) {
            $skills = $request->skills;

            $query->whereIn('skills.id', $skills);
        }

        /**
         * ⚡ Sorting
         */
        switch ($request->sort) {
            case 'price_low':
                $query->orderBy('freelancer_profiles.hourly_rate', 'asc');
                break;

            case 'price_high':
                $query->orderBy('freelancer_profiles.hourly_rate', 'desc');
                break;

            case 'rating':
                $query->orderByDesc('freelancer_profiles.average_rating');
                break;

            default:
                $query->orderByDesc('freelancer_profiles.created_at');
        }

        /**
         * 📄 Pagination
         */
        $freelancers = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $freelancers
        ]);
    }

    /**
     * 🔥 Keep your existing top freelancers (optional)
     */
    public function topFreelancers()
    {
        $freelancers = DB::table('freelancer_profiles')
            ->join('users', 'freelancer_profiles.user_id', '=', 'users.id')
            ->select(
                'users.id',
                'users.first_name',
                'users.last_name',
                'freelancer_profiles.average_rating',
                'freelancer_profiles.completed_jobs'
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