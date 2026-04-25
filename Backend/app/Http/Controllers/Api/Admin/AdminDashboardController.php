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
    public function index(Request $request)
    {
        $range = $request->query('range', '6m');

        // ======================
        // USERS
        // ======================
        $totalUsers = User::withTrashed()->count();

        $freelancersCount = User::where('role', 'freelancer')->count();
        $clientsCount = User::where('role', 'client')->count();

        // Activity Thresholds
        $oneDayAgo = now()->subDay();
        $threeDaysAgo = now()->subDays(3);

        // Freelancer breakdown
        $freelancerActive = User::where('role', 'freelancer')->where('last_seen', '>=', $oneDayAgo)->count();
        $freelancerInactive = User::where('role', 'freelancer')->where('last_seen', '<', $threeDaysAgo)->count();
        $freelancerDeleted = User::onlyTrashed()->where('role', 'freelancer')->count();

        // Client breakdown
        $clientActive = User::where('role', 'client')->where('last_seen', '>=', $oneDayAgo)->count();
        $clientInactive = User::where('role', 'client')->where('last_seen', '<', $threeDaysAgo)->count();
        $clientDeleted = User::onlyTrashed()->where('role', 'client')->count();

        $activeUsers = User::where('is_active', true)->count();
        $suspendedUsers = User::where('is_suspended', true)->count();

        // ======================
        // PROJECTS
        // ======================
        $totalProjects = Project::count();
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

        // ======================
        // GROWTH TRENDS (Dynamic Range - Freelancer vs Client)
        // ======================
        $growth = [];
        
        switch ($range) {
            case '1y':
                for ($i = 11; $i >= 0; $i--) {
                    $date = now()->subMonths($i);
                    $fCount = User::where('role', 'freelancer')->whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count();
                    $cCount = User::where('role', 'client')->whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count();
                    $growth[] = ['label' => $date->format('M Y'), 'freelancers' => $fCount, 'clients' => $cCount];
                }
                break;
            case '3m':
                for ($i = 11; $i >= 0; $i--) {
                    $date = now()->subWeeks($i);
                    $start = $date->copy()->startOfWeek();
                    $end = $date->copy()->endOfWeek();
                    $fCount = User::where('role', 'freelancer')->whereBetween('created_at', [$start, $end])->count();
                    $cCount = User::where('role', 'client')->whereBetween('at', [$start, $end])->count();
                    // Fix: client created_at check
                    $cCount = User::where('role', 'client')->whereBetween('created_at', [$start, $end])->count();
                    $growth[] = ['label' => 'W' . $date->format('W'), 'freelancers' => $fCount, 'clients' => $cCount];
                }
                break;
            case '1m':
                for ($i = 29; $i >= 0; $i--) {
                    $date = now()->subDays($i);
                    $fCount = User::where('role', 'freelancer')->whereDate('created_at', $date->toDateString())->count();
                    $cCount = User::where('role', 'client')->whereDate('created_at', $date->toDateString())->count();
                    $growth[] = ['label' => $date->format('d M'), 'freelancers' => $fCount, 'clients' => $cCount];
                }
                break;
            case '1w':
                for ($i = 6; $i >= 0; $i--) {
                    $date = now()->subDays($i);
                    $fCount = User::where('role', 'freelancer')->whereDate('created_at', $date->toDateString())->count();
                    $cCount = User::where('role', 'client')->whereDate('created_at', $date->toDateString())->count();
                    $growth[] = ['label' => $date->format('D'), 'freelancers' => $fCount, 'clients' => $cCount];
                }
                break;
            case '6m':
            default:
                for ($i = 5; $i >= 0; $i--) {
                    $date = now()->subMonths($i);
                    $fCount = User::where('role', 'freelancer')->whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count();
                    $cCount = User::where('role', 'client')->whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count();
                    $growth[] = ['label' => $date->format('M'), 'freelancers' => $fCount, 'clients' => $cCount];
                }
                break;
        }

        return response()->json([
            'users' => [
                'total' => $totalUsers,
                'freelancers' => [
                    'total' => $freelancersCount,
                    'active' => $freelancerActive,
                    'inactive' => $freelancerInactive,
                    'deleted' => $freelancerDeleted,
                ],
                'clients' => [
                    'total' => $clientsCount,
                    'active' => $clientActive,
                    'inactive' => $clientInactive,
                    'deleted' => $clientDeleted,
                ],
                'active_general' => $activeUsers,
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
            'growth' => $growth,
        ]);
    }
}