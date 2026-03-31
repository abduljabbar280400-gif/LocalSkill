<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SkillController extends Controller
{
    /**
     * GET /api/skills
     * Optional filters:
     * - category_id
     * - category_slug
     */
    public function index(Request $request): JsonResponse
    {
        $query = Skill::query()
            ->where('is_active', true);

        // Filter by category_id
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by category_slug
        if ($request->filled('category_slug')) {
            $category = Category::where('slug', $request->category_slug)
                ->where('is_active', true)
                ->first();

            if (! $category) {
                return response()->json([
                    'data' => [],
                ]);
            }

            $query->where('category_id', $category->id);
        }

        $skills = $query
            ->orderBy('name')
            ->get([
                'id',
                'category_id',
                'name',
                'slug',
            ]);

        return response()->json([
            'data' => $skills,
        ]);
    }
    public function byCategory($categoryId)
{
    $skills = Skill::where('category_id', $categoryId)->get();

    return response()->json($skills);
}
}
