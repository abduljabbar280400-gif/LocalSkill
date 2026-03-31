<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

use App\Events\ProfileLocationUpdated;

class ClientProfileController extends Controller
{
    /**
     * GET client profile
     */
    public function show(Request $request, string $username): JsonResponse
    {
        $authUser = $request->user();

        // 🔒 Ensure user matches token
        if ($authUser->username !== $username) {
            return response()->json([
                'message' => 'Unauthorized access.'
            ], 403);
        }

        $profile = ClientProfile::where('user_id', $authUser->id)
            ->whereNull('deleted_at')
            ->first();

        return response()->json([
            'profile' => $profile
        ]);
    }

    /**
     * UPDATE client profile
     */
    public function update(Request $request, string $username): JsonResponse
{
    $authUser = $request->user();

    if ($authUser->username !== $username) {
        return response()->json([
            'message' => 'Unauthorized access.'
        ], 403);
    }

    $profile = ClientProfile::where('user_id', $authUser->id)
        ->whereNull('deleted_at')
        ->firstOrFail();

        // ✅ STORE OLD LOCATION BEFORE UPDATE
        $oldLatitude = $profile->latitude;
        $oldLongitude = $profile->longitude;

    $validated = $request->validate([
        'company_name' => ['nullable', 'string', 'max:255'],
        'company_website' => ['nullable', 'url', 'max:255'],
        'industry' => ['nullable', 'string', 'max:100'],
        'company_size' => ['nullable', 'string', 'max:50'],
        'description' => ['nullable', 'string'],
        'state' => ['nullable', 'string', 'max:100'],
        'city' => ['nullable', 'string', 'max:100'],
        'postcode' => ['nullable', 'string', 'max:20'],
        'latitude' => ['nullable', 'numeric'],
        'longitude' => ['nullable', 'numeric'],
    ]);

    $profile->update($validated);

     // ✅ CHECK IF LOCATION CHANGED
        $locationChanged =
            $oldLatitude != $profile->latitude ||
            $oldLongitude != $profile->longitude;

             // 🔥 FIRE EVENT ONLY IF LOCATION CHANGED
        if ($locationChanged) {
            event(new ProfileLocationUpdated($authUser, $profile));
        }


    // ✅ Completion Logic
    $requiredFields = [
        'company_name',
        'industry',
        'company_size',
        'state',
        'city',
        'postcode',
        'latitude',
        'longitude',
    ];

    $isComplete = true;

    foreach ($requiredFields as $field) {
        if (empty($profile->$field)) {
            $isComplete = false;
            break;
        }
    }

    $profile->is_profile_completed = $isComplete;
    $profile->save();

    return response()->json([
        'message' => 'Profile updated successfully.',
        'is_profile_completed' => $profile->is_profile_completed,
        'profile' => $profile
    ]);
}

// Delete
public function destroy(Request $request, string $username)
{
    $authUser = $request->user();
    if ($authUser->username !== $username) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $authUser->delete(); // Soft delete
    return response()->json(['message' => 'User deleted successfully']);
}

}
