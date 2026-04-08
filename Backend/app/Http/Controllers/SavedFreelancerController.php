<?php

namespace App\Http\Controllers;

use App\Models\SavedFreelancer;
use Illuminate\Http\Request;

class SavedFreelancerController extends Controller
{
    // GET /saved-freelancers
    public function index(Request $request)
    {
        $saved = SavedFreelancer::where('user_id', $request->user()->id)
            ->pluck('freelancer_profile_id');

        return response()->json($saved);
    }

    // POST /saved-freelancers/{id}
    public function store($id, Request $request)
    {
        SavedFreelancer::firstOrCreate([
            'user_id' => $request->user()->id,
            'freelancer_profile_id' => $id,
        ]);

        return response()->json(['message' => 'Saved']);
    }

    // DELETE /saved-freelancers/{id}
    public function destroy($id, Request $request)
    {
        SavedFreelancer::where([
            'user_id' => $request->user()->id,
            'freelancer_profile_id' => $id,
        ])->delete();

        return response()->json(['message' => 'Removed']);
    }
    public function details($username, Request $request)
{
    if ($request->user()->username !== $username) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $saved = SavedFreelancer::where('user_id', $request->user()->id)
        ->with([
        'freelancerProfile.user',
        'freelancerProfile.skills.skill' // 🔥 ADD HERE
    ])
        ->get();

    return response()->json(
        $saved->map(function ($item) {
            $profile = $item->freelancerProfile;
            $user = $profile->user;

            return [
                'id' => $user->id,
                'profile_id' => $profile->id,
                'username' => $user->username, // ✅ FIX
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'professional_title' => $profile->professional_title,
                'bio' => $profile->bio,
                'hourly_rate' => $profile->hourly_rate,
                'availability_status' => $profile->availability_status,
                'skills' => $profile->skills->map(function ($item) {
                    return [
                        'name' => $item->skill->name,
                        'experience_years' => $item->experience_years,
                        'is_primary' => $item->is_primary,
                    ];
                }),
            ];
        })
    );
}
}