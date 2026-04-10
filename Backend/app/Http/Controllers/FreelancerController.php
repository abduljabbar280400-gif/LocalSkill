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
        ->where('users.role', 'freelancer')
        ->where('freelancer_profiles.profile_visibility', 'visible') 
        ->where('freelancer_profiles.onboarding_completed', true)
        ->select(
            'users.id',
            'users.username',
            'users.first_name',
            'users.last_name',
            'freelancer_profiles.id as profile_id',
            'freelancer_profiles.professional_title',
            'freelancer_profiles.bio',
            'freelancer_profiles.experience_level',
            'freelancer_profiles.hourly_rate',
            'freelancer_profiles.currency',
            'freelancer_profiles.average_rating',
            'freelancer_profiles.total_reviews',
            'freelancer_profiles.availability_status',
            'freelancer_profiles.latitude',
            'freelancer_profiles.longitude',
            'freelancer_profiles.created_at'
        );

    // 🔍 Search
    if ($request->filled('search')) {
        $query->where(function ($q) use ($request) {
            $q->where('users.first_name', 'ILIKE', '%' . $request->search . '%')
              ->orWhere('users.last_name', 'ILIKE', '%' . $request->search . '%')
              ->orWhere('freelancer_profiles.professional_title', 'ILIKE', '%' . $request->search . '%');
        });
    }

    // 🎯 Experience
    if ($request->filled('experience')) {
        $query->where('freelancer_profiles.experience_level', $request->experience);
    }

    // 💰 Rate
    if ($request->filled('min_rate')) {
        $query->where('freelancer_profiles.hourly_rate', '>=', $request->min_rate);
    }

    if ($request->filled('max_rate')) {
        $query->where('freelancer_profiles.hourly_rate', '<=', $request->max_rate);
    }

    // 📂 Category
    if ($request->filled('category_id')) {
        $query->where('freelancer_profiles.primary_category_id', $request->category_id);
    }

    // 🧠 Skills Filter
    if ($request->filled('skills')) {
        $skills = $request->skills;

        $query->whereExists(function ($q) use ($skills) {
            $q->select(DB::raw(1))
              ->from('freelancer_skills')
              ->whereColumn('freelancer_skills.freelancer_profile_id', 'freelancer_profiles.id')
              ->whereIn('freelancer_skills.skill_id', $skills);
        });
    }

    // ⚡ Sorting
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

    // 📄 Pagination
    $freelancers = $query->paginate(10);

    /**
     * 🧠 Attach skills (FIXED)
     */
    $profileIds = collect($freelancers->items())->pluck('profile_id');

    $skillsMapQuery = DB::table('freelancer_skills')
        ->join('skills', 'freelancer_skills.skill_id', '=', 'skills.id')
        ->whereIn('freelancer_skills.freelancer_profile_id', $profileIds);

    // ✅ ONLY apply if skills filter exists
    if ($request->filled('skills')) {
        $skillsMapQuery->whereIn('skills.id', $request->skills);
    }

    $skillsMap = $skillsMapQuery
        ->select(
            'freelancer_skills.freelancer_profile_id',
            'skills.name',
            'freelancer_skills.is_primary',
            'freelancer_skills.experience_years'
        )
        ->get()
        ->groupBy('freelancer_profile_id');

    /**
     * 🔄 Merge skills
     */
    $freelancers->getCollection()->transform(function ($freelancer) use ($skillsMap) {
        $skills = $skillsMap[$freelancer->profile_id] ?? collect([]);

        // $freelancer->skills = $skills->pluck('name')->values();
        $freelancer->skills = $skills->map(function ($skill) {
    return [
        'name' => $skill->name,
        'is_primary' => (bool) $skill->is_primary,
        'experience_years' => $skill->experience_years,
    ];
})->values();

        return $freelancer;
    });

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