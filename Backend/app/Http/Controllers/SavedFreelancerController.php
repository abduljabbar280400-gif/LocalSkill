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
}