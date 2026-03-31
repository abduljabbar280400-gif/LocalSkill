<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Skill;
use App\Models\FreelancerProfile;
use App\Models\FreelancerSkill;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FreelancerSkillController extends Controller
{
    /**
     * GET skills for logged-in freelancer
     */
    public function index(Request $request, string $username): JsonResponse
    {
        $user = $this->resolveUser($request, $username);
        $profile = $this->getProfile($user);

        $skills = FreelancerSkill::where('freelancer_profile_id', $profile->id)
            ->with('skill:id,name,slug')
            ->get();

        return response()->json([
            'data' => $skills,
        ]);
    }


    // public function skill()
    // {
    //     return $this->belongsTo(Skill::class);
    // }


    public function store(Request $request, string $username): JsonResponse
    {
        $user = $this->resolveUser($request, $username);
        $profile = $this->getProfile($user);

        $validated = $request->validate([
            'skill_id' => ['required', 'integer', 'exists:skills,id'],
            'experience_years' => ['nullable', 'integer', 'min:0'],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        // Prevent duplicate skill
        if (FreelancerSkill::where('freelancer_profile_id', $profile->id)
            ->where('skill_id', $validated['skill_id'])
            ->exists()) {
            return response()->json([
                'message' => 'Skill already added',
            ], 409);
        }

        // If primary skill, unset previous primary
        if (!empty($validated['is_primary'])) {
            FreelancerSkill::where('freelancer_profile_id', $profile->id)
                ->update(['is_primary' => false]);
        }

        $skill = FreelancerSkill::create([
            'freelancer_profile_id' => $profile->id,
            'skill_id' => $validated['skill_id'],
            'experience_years' => $validated['experience_years'] ?? 0,
            'is_primary' => $validated['is_primary'] ?? false,
        ]);

        return response()->json([
            'message' => 'Skill added',
            'data' => $skill,
        ], 201);
    }

    /**
     * UPDATE skill
     */
    public function update(
        Request $request,
        string $username,
        int $skillId
    ): JsonResponse {
        $user = $this->resolveUser($request, $username);
        $profile = $this->getProfile($user);

        $freelancerSkill = FreelancerSkill::where('freelancer_profile_id', $profile->id)
            ->where('skill_id', $skillId)
            ->firstOrFail();

        $validated = $request->validate([
            'experience_years' => ['nullable', 'integer', 'min:0'],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        if (!empty($validated['is_primary'])) {
            FreelancerSkill::where('freelancer_profile_id', $profile->id)
                ->update(['is_primary' => false]);
        }

        $freelancerSkill->update($validated);

        return response()->json([
            'message' => 'Skill updated',
            'data' => $freelancerSkill,
        ]);
    }

    /**
     * REMOVE skill
     */
    public function destroy(
        Request $request,
        string $username,
        int $skillId
    ): JsonResponse {
        $user = $this->resolveUser($request, $username);
        $profile = $this->getProfile($user);

        FreelancerSkill::where('freelancer_profile_id', $profile->id)
            ->where('skill_id', $skillId)
            ->delete();

        return response()->json([
            'message' => 'Skill removed',
        ]);
    }

    /**
     * Helpers
     */
    private function resolveUser(Request $request, string $username): User
    {
        $user = User::where('username', $username)->firstOrFail();

        if ($request->user()->id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        return $user;
    }

    private function getProfile(User $user): FreelancerProfile
    {
        return FreelancerProfile::where('user_id', $user->id)->firstOrFail();
    }
}
