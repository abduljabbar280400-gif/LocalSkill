<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller; 
use App\Models\Project;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Proposal;   

class ProjectController extends Controller
{

/* ======================================================
   STORE PROJECT
====================================================== */
public function store(Request $request, $username)
{
    // dd($request->all());
    $user = $request->user();

    if ($user->username !== $username) {
        return response()->json([
            'message' => 'Unauthorized action.'
        ], 403);
    }

    $validated = $request->validate([
        'title'              => 'required|string|max:255',
        'description'        => 'required|string',
        'category_id'        => 'required|exists:categories,id',
        'budget_min'         => 'nullable|numeric|min:0',
        'budget_max'         => 'nullable|numeric|gte:budget_min',
        'budget_type'        => 'required|in:fixed,hourly,weekly,monthly',
        'experience_level'   => 'required|in:student,beginner,intermediate,advanced',
        'preferred_work_type' => 'required|in:remote,local,both',
        'duration'           => 'nullable|string|max:100',
        'location'           => 'nullable|string|max:255',
        'postal_code'        => 'nullable|string|max:20',
        'location_type'      => 'required|in:profile,custom',
        'latitude'           => 'nullable|numeric',
        'longitude'          => 'nullable|numeric',
        'deadline'           => 'nullable|date|after:today',
        'skills'             => 'required|array|min:1',
        'skills.*'           => 'exists:skills,id',
    ]);

    return DB::transaction(function () use ($validated, $user) {

        // ✅ If using profile → override values
    if ($validated['location_type'] === 'profile') {

       $profile = $user->clientProfile; // adjust relation if needed

        $validated['latitude'] = $profile->latitude ?? null;
        $validated['longitude'] = $profile->longitude ?? null;
        $validated['postal_code'] = $profile->postcode ?? null;
    }

        $project = Project::create([
            'user_id'          => $user->id,
            'title'            => $validated['title'],
            'description'      => $validated['description'],
            'category_id'      => $validated['category_id'],
            'budget_min'       => $validated['budget_min'] ?? null,
            'budget_max'       => $validated['budget_max'] ?? null,
            'budget_type'      => $validated['budget_type'],
            'preferred_work_type' => $validated['preferred_work_type'],
            'experience_level' => $validated['experience_level'],
            'duration'         => $validated['duration'] ?? null,
            'location'         => $validated['location'] ?? null,
            'postal_code'      => $validated['postal_code'] ?? null,
            'latitude'         => $validated['latitude'] ?? null,
            'longitude'        => $validated['longitude'] ?? null,
            'deadline'         => $validated['deadline'] ?? null,
            'status'           => 'open',
        ]);

        $project->skills()->sync($validated['skills']);

        // Generate SEO-safe slug
        $project->slug = Str::slug($project->title) . '-' . $project->id;
        $project->save();

        return response()->json([
            'message' => 'Project created successfully',
            'data' => [
                'id'     => $project->id,
                'title'  => $project->title,
                'url'    => url("/projects/{$project->slug}"),
                'status' => $project->status,
            ]
        ], 201);
    });
}


/* ======================================================
   DELETE PROJECT
====================================================== */
public function destroy(Request $request, $username, Project $project)
{
    $user = $request->user();

    if ($user->username !== $username || $project->user_id !== $user->id) {
        return response()->json([
            'message' => 'Unauthorized action.'
        ], 403);
    }

    $project->delete();

    return response()->json([
        'message' => 'Project deleted successfully'
    ]);
}


/* ======================================================
   PUBLIC PROJECT LIST
====================================================== */
public function index(Request $request)
{
    $query = Project::query()
        ->whereNull('deleted_at')
        ->where('status', 'open')
        ->where('is_active', true)
        ->select([
            'id',
            'title',
            'slug',
            'category_id',
            'user_id',
            'budget_min',
            'budget_max',
            'experience_level',
            'created_at'
        ])
        ->withCount('proposals')
        ->with(['skills', 'category:id,name',  'user:id,first_name,last_name']);

    

    // ✅ FILTERS
    if ($request->filled('category_id')) {
        $query->where('category_id', $request->category_id);
    }

    if ($request->filled('experience_level')) {
        $query->where('experience_level', $request->experience_level);
    }

    if ($request->filled('min_budget')) {
        $query->where('budget_min', '>=', $request->min_budget);
    }

    if ($request->filled('max_budget')) {
        $query->where('budget_max', '<=', $request->max_budget);
    }

    if ($request->filled('skill_id')) {
        $query->whereHas('skills', function ($q) use ($request) {
            $q->where('skills.id', $request->skill_id);
        });
    }

    // 🔥 FULL-TEXT SEARCH (VERY IMPORTANT)
    if ($request->filled('search')) {
        $search = $request->search;

        $query->whereRaw("
            to_tsvector('english', title || ' ' || description)
            @@ plainto_tsquery(?)
        ", [$search]);
    }



 $allowedSorts = [
        'title',
        'budget_min',
        'budget_max',
        'status',
        'deadline',
        'created_at'
    ];

    $sortField = in_array($request->sort, $allowedSorts)
        ? $request->sort
        : 'created_at';

    $sortDirection = $request->direction === 'asc' ? 'asc' : 'desc';

    $query->orderBy($sortField, $sortDirection);


$projects = $query->paginate(10);

    return response()->json($projects);
}


/* ======================================================
   PUBLIC PROJECT DETAILS
====================================================== */
public function show(Request $request, $slug)
{
    // Extract ID from slug (example: need-a-data-analyst-13)
    $parts = explode('-', $slug);
    $id = end($parts);

    if (!is_numeric($id)) {
        return response()->json([
            'message' => 'Invalid project URL'
        ], 404);
    }

    $project = Project::withCount('proposals')
        ->with(['skills', 'category', 'user'])
        ->where('id', $id)
        ->where('status', 'open')
        ->whereNull('deleted_at')
        ->where(function ($q) {
            $q->where('is_active', true)
              ->orWhereNull('is_active');
        })
        ->first();

    if (!$project) {
        return response()->json([
            'message' => 'Project not found.'
        ], 404);
    }
    
    $user = auth()->user();
    // 🔎 Check if logged-in freelancer already submitted proposal
    $hasApplied = false;


    if ($user && $user->role === 'freelancer') {
        $hasApplied = Proposal::where('project_id', $project->id)
            ->where('freelancer_id', $user->id)
            ->exists();
    }

    return response()->json([
        ...$project->toArray(),
        'has_applied' => $hasApplied
    ]);
}


/* ======================================================
   CLIENT PROJECTS
====================================================== */
public function clientProjects(Request $request, $username)
{
    $user = $request->user();

    if ($user->username !== $username) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $projects = Project::with(['skills', 'category'])
        ->where('user_id', $user->id)
        ->latest()
        ->paginate(10);

    return response()->json($projects);
}


/* ======================================================
   UPDATE PROJECT
====================================================== */
public function update(Request $request, $username, Project $project)
{
    $user = $request->user();

    if ($user->username !== $username || $project->user_id !== $user->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    if ($request->filled('experience_level')) {
        $request->merge([
            'experience_level' => strtolower($request->experience_level)
        ]);
    } else {
        $request->request->remove('experience_level');
    }

    $validated = $request->validate([
        'title' => 'sometimes|string|max:255',
        'description' => 'sometimes|string',
        'category_id' => 'sometimes|exists:categories,id',
        'budget_min' => 'required|numeric|min:0',
        'budget_max' => 'required|numeric|gte:budget_min',
        'budget_type' => 'sometimes|in:fixed,hourly,weekly,monthly',
        'experience_level' => 'sometimes|in:student,beginner,intermediate,advanced',
        'preferred_work_type' => 'sometimes|in:remote,local,both',
        'duration' => 'nullable|string|max:100',
        'location' => 'nullable|string|max:255',
        'postal_code' => 'nullable|string|max:20',
        'latitude' => 'nullable|numeric',
        'longitude' => 'nullable|numeric',
        'location_type' => 'required|in:profile,custom',
        'deadline' => 'nullable|date|after_or_equal:today',
        'status' => 'sometimes|in:open,closed,in_progress,completed,cancelled',
        'skills' => 'sometimes|array',
        'skills.*' => 'exists:skills,id',
    ]);

     return DB::transaction(function () use (&$validated, $project, $user) {

    if (isset($validated['title'])) {
        $project->slug = Str::slug($validated['title']) . '-' . $project->id;
    }

    if ($validated['location_type'] === 'profile') {

            $profile = $user->clientProfile;

            if (!$profile) {
    abort(422, 'Profile location not found');
}

            $validated['latitude'] = $profile->latitude;
            $validated['longitude'] = $profile->longitude;
            $validated['postal_code'] = $profile->postcode;
        }

    $project->fill($validated);
    $project->save();

    if (isset($validated['skills'])) {
            $project->skills()->sync($validated['skills']);
        }

    return response()->json([
        'message' => 'Project updated successfully'
    ]);
     });
}


/* ======================================================
   RESTORE PROJECT
====================================================== */
public function restore($id)
{
    $project = Project::withTrashed()->findOrFail($id);
    $project->restore();

    return response()->json(['message' => 'Project restored']);
}

/* ======================================================
   VIEW PROJECT PROPOSALS (CLIENT)
====================================================== */
public function viewProjectProposals(Request $request, $username, Project $project)
{
    $user = $request->user();

    // 🔐 Security Check
    if ($user->username !== $username || $project->user_id !== $user->id) {
        return response()->json([
            'message' => 'Unauthorized action.'
        ], 403);
    }

    // 📦 Fetch proposals (Newest First)
    $proposals = Proposal::with([
    'freelancer:id,first_name,last_name,username',
    'freelancer.freelancerProfile:user_id,average_rating,completed_jobs'
])
    ->where('project_id', $project->id)
    ->orderBy('created_at', 'desc')
    ->paginate(10);

    return response()->json([
        'proposals' => $proposals->items(),
        'pagination' => [
            'current_page' => $proposals->currentPage(),
            'last_page'    => $proposals->lastPage(),
            'per_page'     => $proposals->perPage(),
            'total'        => $proposals->total(),
        ]
    ]);
}
public function related($slug)
{
    // Extract ID from slug
    $parts = explode('-', $slug);
    $projectId = end($parts);

    if (!is_numeric($projectId)) {
        return response()->json([
            'message' => 'Invalid project URL'
        ], 404);
    }

    // Get current project
    $project = Project::with('skills')->findOrFail($projectId);

    $skillIds = $project->skills->pluck('id');

    // Related projects
    $relatedProjects = Project::query()
        ->where('projects.id', '!=', $project->id)
        ->where('projects.status', 'open')
        ->where('projects.is_active', true)

        // Match same category
        ->where('projects.category_id', $project->category_id)

        // Join for skill matching
        ->leftJoin('project_skills', 'projects.id', '=', 'project_skills.project_id')

        // Count matching skills
        ->selectRaw('
            projects.*,
            COUNT(CASE WHEN project_skills.skill_id IN (' . ($skillIds->isEmpty() ? '0' : $skillIds->implode(',')) . ') THEN 1 END) as skill_match_count
        ')

        ->groupBy('projects.id')

        ->orderByDesc('skill_match_count') // 🔥 most relevant first

        ->with(['skills', 'category', 'user'])
        ->withCount('proposals')

        ->limit(6)
        ->get();

        if ($relatedProjects->isEmpty()) {
    $relatedProjects = Project::where('id', '!=', $project->id)
        ->where('status', 'open')
        ->where('is_active', true)
        ->latest()
        ->limit(6)
        ->with(['skills', 'category', 'user'])
        ->withCount('proposals')
        ->get();
}

    return response()->json($relatedProjects);
}

public function showClientProject(Request $request, $username, Project $project)
{
    $user = $request->user();

    if ($user->username !== $username || $project->user_id !== $user->id) {
        return response()->json([
            'message' => 'Unauthorized'
        ], 403);
    }

    return response()->json($project->load(['skills', 'category']));
}


public function nearbyProjects(Request $request)
{
    $request->validate([
        'lat' => 'required|numeric',
        'lng' => 'required|numeric',
    ]);

    $lat = $request->lat;
    $lng = $request->lng;
    $radius = 15; // km

    $projects = DB::table(DB::raw("
    (
        SELECT 
            id,
            title,
            slug,
            postal_code,
            latitude,
            longitude,
            (6371 * acos(
                cos(radians($lat)) *
                cos(radians(latitude)) *
                cos(radians(longitude) - radians($lng)) +
                sin(radians($lat)) *
                sin(radians(latitude))
            )) AS distance
        FROM projects
        WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
    ) as sub
"))
->where('distance', '<=', $radius)
->orderBy('id', 'desc') 
->limit(6)
->get();

    return response()->json([
        'success' => true,
        'data' => $projects
    ]);
}
}