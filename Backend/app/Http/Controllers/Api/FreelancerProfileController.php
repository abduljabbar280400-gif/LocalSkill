<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Category;
use App\Models\FreelancerSkill;
use App\Models\Skill;
use App\Models\Review;
use App\Models\FreelancerProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;


class FreelancerProfileController extends Controller
{
    /**
     * GET profile (draft or completed)
     */
    public function show(Request $request, string $username): JsonResponse
{
    // Use sanctum guard explicitly
    $authUser = $request->user('sanctum');

    $user = User::where('username', $username)->firstOrFail();

    $profile = FreelancerProfile::where('user_id', $user->id)
    ->select('*')
    ->first();

    if (!$profile) {
        return response()->json([
            'message' => 'Profile not found'
        ], 404);
    }

    /*
    |----------------------------------------
    | Profile Visibility Check
    |----------------------------------------
    */

    if ($profile->profile_visibility === 'hidden') {

        // Allow only the owner to view hidden profile
        if (!$authUser || $authUser->id !== $user->id) {
            return response()->json([
                'message' => 'This profile is private'
            ], 403);
        }
    }

    // Get Category
    $category = null;
    if ($profile && $profile->primary_category_id) {
        $category = Category::where('id', $profile->primary_category_id)->first();
    }

    // Get Skills
    $skills = [];
    if ($profile) {
        $skills = FreelancerSkill::where('freelancer_profile_id', $profile->id)
            ->join('skills', 'freelancer_skills.skill_id', '=', 'skills.id')
            ->select('skills.id', 'skills.name')
            ->get();
    }

    // Get Reviews
    $reviews = Review::where('freelancer_id', $user->id)
        ->join('users', 'reviews.client_id', '=', 'users.id')
        ->select(
            'reviews.id',
            'reviews.rating',
            'reviews.review_comment',
            'reviews.created_at',
            \DB::raw("users.first_name || ' ' || users.last_name as client_name")
        )
        ->orderBy('reviews.created_at', 'desc')
        ->get();

    return response()->json([
        'profile' => $profile,
        'category' => $category,
        'skills' => $skills,
        'reviews' => $reviews
    ]);
}
    public function update(Request $request, string $username): JsonResponse
    {
// dd($request->input('languages'));

        $user = User::where('username', $username)->firstOrFail();
        $this->authorizeUser($request, $user);

        $profile = FreelancerProfile::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'professional_title' => ['sometimes', 'string', 'max:150'],
            'primary_category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'experience_level' => ['sometimes', Rule::in(['student', 'beginner', 'intermediate','advanced'])],
            
            'bio' => ['nullable', 'string'],
            'hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'preferred_work_type' => ['nullable', Rule::in(['remote', 'local', 'both'])],
            'availability_status' => ['nullable', Rule::in(['available', 'busy', 'unavailable'])],
            'city' => ['nullable', 'string', 'max:100'],
            'postcode' => ['nullable', 'string', 'max:20'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'search_radius_km' => ['nullable', 'integer', 'min:1'],
            'profile_visibility' => ['nullable', Rule::in(['visible', 'hidden'])],

            'country' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'street_address' => ['nullable', 'string', 'max:255'],
            'landmark' => ['nullable', 'string', 'max:255'],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', 'max:50'],
        ]);

        if ($request->has('languages')) {
    $profile->languages = $request->input('languages');
}

$profile->fill(collect($validated)->except('languages')->toArray());
$profile->save();

$result = $this->calculateCompletionWithMissing($profile);
$completion = $result['percentage'];
$missingFields = $result['missing'];

$profile->update([
    'onboarding_completed' => $result['percentage'] === 100
]);
        return response()->json([
            'message' => 'Profile updated',
            'profile' => $profile,
            'completion' => $completion,
            'missing_fields' =>  $missingFields,
        ]);
    }

    /**
     * COMPLETE onboarding
     */
    public function complete(Request $request, string $username): JsonResponse
    {
        $user = User::where('username', $username)->firstOrFail();
        $this->authorizeUser($request, $user);

        $profile = FreelancerProfile::where('user_id', $user->id)->firstOrFail();

        // Minimal completion checks (skills check comes later)
        if (! $profile->hourly_rate || ! $profile->city) {
            return response()->json([
                'message' => 'Profile incomplete',
            ], 422);
        }

        $profile->update([
            'onboarding_completed' => true,
            'profile_visibility' => 'visible',
            'languages' => $request->languages,
        ]);

        return response()->json([
            'message' => 'Onboarding completed',
        ]);
    }

    /**
     * Ownership check
     */
    private function authorizeUser(Request $request, User $user): void
    {
        if ($request->user()->id !== $user->id) {
            abort(403, 'Unauthorized');
        }
    }

    /**
 * Soft delete freelancer account
 */
public function destroy(Request $request, string $username): JsonResponse
{
    $user = User::where('username', $username)->firstOrFail();

    $this->authorizeUser($request, $user);

    // Revoke all Sanctum tokens
    $user->tokens()->delete();

    // Soft delete user
    $user->delete();

    return response()->json([
        'message' => 'Freelancer account deleted successfully',
    ]);
}
public function myProfile(Request $request, string $username): JsonResponse
{
    $authUser = $request->user();

    // Ensure logged-in user matches username
    if ($authUser->username !== $username) {
        return response()->json([
            'message' => 'Unauthorized'
        ], 403);
    }

    $profile = FreelancerProfile::where('user_id', $authUser->id)->first();

    if (!$profile) {
        return response()->json([
            'message' => 'Profile not found'
        ], 404);
    }

    // Category
    $category = null;
    if ($profile->primary_category_id) {
        $category = Category::find($profile->primary_category_id);
    }

    // Skills
    $skills = FreelancerSkill::where('freelancer_profile_id', $profile->id)
        ->join('skills', 'freelancer_skills.skill_id', '=', 'skills.id')
        ->select('skills.id', 'skills.name')
        ->get();

    // Reviews
    $reviews = Review::where('freelancer_id', $authUser->id)
        ->join('users', 'reviews.client_id', '=', 'users.id')
        ->select(
            'reviews.id',
            'reviews.rating',
            'reviews.review_comment',
            'reviews.created_at',
            \DB::raw("users.first_name || ' ' || users.last_name as client_name")
        )
        ->orderBy('reviews.created_at', 'desc')
        ->get();


      
    $result = $this->calculateCompletionWithMissing($profile);
    $completion = $result['percentage'];

    return response()->json([
        'profile' => $profile,
        // ?? new \stdClass(),
        'user' => [
         'title' => $authUser->title,
         'first_name' => $authUser->first_name,
            'last_name' => $authUser->last_name,
            'username' => $authUser->username,
            'email' => $authUser->email,
            'phone' => $authUser->phone,
            'dob' => $authUser->dob,
        ],
        'category' => $category,
        'skills' => $skills,
        'reviews' => $reviews,
        'completion' => $completion,
        'missing_fields' => $result['missing'],
    ]);
}

private function calculateCompletionWithMissing($profile)
{
    $fields = [
        'professional_title' => 'Add professional title',
        'primary_category_id' => 'Select category',
        'experience_level' => 'Select experience level',
        'bio' => 'Add bio',
        'hourly_rate' => 'Set hourly rate',
        'currency' => 'Select currency',
        'country' => 'Add country',
        'state' => 'Add state',
        'city' => 'Add city',
        'postcode' => 'Add pincode',
        'street_address' => 'Add street address',
        'languages' => 'Add at least one language',
    ];

    $total = count($fields);
    $completed = 0;
    $missing = [];

    foreach ($fields as $key => $message) {
        if ($key === 'languages') {
    if (is_array($profile->languages) && count($profile->languages) > 0) {
        $completed++;
    } else {
        $missing[] = $message;
    }
}
         else {
            if (!empty($profile->$key)) {
                $completed++;
            } else {
                $missing[] = $message;
            }
        }
    }

    $percentage = round(($completed / $total) * 100);

    return [
        'percentage' => $percentage,
        'missing' => $missing
    ];
}

public function approveProfile($id)
{
    $profile = FreelancerProfile::findOrFail($id);

    $profile->profile_approved = true;
    $profile->save();

    return response()->json([
        'message' => 'Profile approved'
    ]);
}
}
