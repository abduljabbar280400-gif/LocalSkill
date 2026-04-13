<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Models\FreelancerProfile;
use App\Models\ClientProfile;
use App\Models\Project;
use App\Models\Contract;
use App\Models\Review;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // ======================
        // USERS
        // ======================
        $totalUsers = User::count();

        $freelancers = User::where('role', 'freelancer')->count();
        $clients = User::where('role', 'client')->count();

        $activeUsers = User::where('is_active', true)->count();
        $suspendedUsers = User::where('is_suspended', true)->count();

        // ======================
        // PROJECTS
        // ======================
        $totalProjects = Project::count();

        // adjust if you have status column
        $completedProjects = Project::where('status', 'completed')->count();

        // ======================
        // CONTRACTS
        // ======================
        $totalContracts = Contract::count();

        // ======================
        // FREELANCER APPROVAL
        // ======================
        $pendingFreelancers = FreelancerProfile::where('profile_approved', false)
            ->where('onboarding_completed', true)
            ->count();

        // ======================
        // REVIEWS
        // ======================
        $totalReviews = Review::count();

        return response()->json([
            'users' => [
                'total' => $totalUsers,
                'freelancers' => $freelancers,
                'clients' => $clients,
                'active' => $activeUsers,
                'suspended' => $suspendedUsers,
            ],
            'projects' => [
                'total' => $totalProjects,
                'completed' => $completedProjects,
            ],
            'contracts' => [
                'total' => $totalContracts,
            ],
            'freelancers' => [
                'pending_approval' => $pendingFreelancers,
            ],
            'reviews' => [
                'total' => $totalReviews,
            ],
        ]);
    }
}