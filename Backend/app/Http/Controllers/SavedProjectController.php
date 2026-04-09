<?php

namespace App\Http\Controllers;

use App\Models\SavedProject;
use Illuminate\Http\Request;

class SavedProjectController extends Controller
{
    // ✅ Get all saved projects
    public function index(Request $request)
    {
        $user = $request->user();

        $saved = SavedProject::with('project.user','project.skills','project.category')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json($saved);
    }

    // 🔥 TOGGLE SAVE / UNSAVE
    public function toggle(Request $request, $projectId)
    {
        $user = $request->user();

        $existing = SavedProject::where('user_id', $user->id)
            ->where('project_id', $projectId)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'status' => 'removed'
            ]);
        }

        SavedProject::create([
            'user_id' => $user->id,
            'project_id' => $projectId,
        ]);

        return response()->json([
            'status' => 'saved'
        ]);
    }
}