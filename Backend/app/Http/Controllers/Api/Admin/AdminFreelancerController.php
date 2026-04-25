<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FreelancerProfile;

class AdminFreelancerController extends Controller
{
    public function pending()
{
    $freelancers = FreelancerProfile::with('user')
        ->where('profile_approved', false)
        ->where('onboarding_completed', true)
        ->latest()
        ->paginate(20);

    return response()->json($freelancers);
}
public function approve($id)
{
    $profile = FreelancerProfile::findOrFail($id);

    if ($profile->profile_approved) {
        return response()->json([
            'message' => 'Already approved'
        ], 400);
    }

    $profile->update([
        'profile_approved' => true,
        'profile_approved_at' => now(),
        'profile_visibility' => 'visible'
    ]);

    return response()->json([
        'message' => 'Freelancer approved successfully'
    ]);
}
public function reject($id)
{
    $profile = FreelancerProfile::findOrFail($id);

    $profile->update([
        'profile_approved' => false,
        'profile_visibility' => 'hidden', // important
    ]);

    return response()->json([
        'message' => 'Freelancer rejected successfully'
    ]);
}
public function unverify($id)
{
    $profile = FreelancerProfile::findOrFail($id);

    $profile->update([
        'profile_approved' => false,
        'profile_approved_at' => null,
    ]);

    return response()->json([
        'message' => 'Freelancer unverified successfully'
    ]);
}
}
