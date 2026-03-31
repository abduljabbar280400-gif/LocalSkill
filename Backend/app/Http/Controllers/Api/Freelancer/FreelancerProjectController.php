<?php

namespace App\Http\Controllers\Api\Freelancer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FreelancerProjectController extends Controller
{
    public function index(Request $request, $username)
    {
        $user = $request->user();

        // Security check
        if ($user->username !== $username) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $freelancerId = $user->id;

        /*
        |--------------------------------------------------------------------------
        | Proposal Counts
        |--------------------------------------------------------------------------
        */

        $proposalCount = DB::table('proposals')
            ->where('freelancer_id', $freelancerId)
            ->count();

        $acceptedProposals = DB::table('proposals')
            ->where('freelancer_id', $freelancerId)
            ->where('status', 'accepted')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Contract Counts
        |--------------------------------------------------------------------------
        */

        $activeContracts = DB::table('contracts')
            ->join('proposals', 'proposals.id', '=', 'contracts.proposal_id')
            ->where('proposals.freelancer_id', $freelancerId)
            ->where('contracts.status', 'active')
            ->count();

        $completedContracts = DB::table('contracts')
            ->join('proposals', 'proposals.id', '=', 'contracts.proposal_id')
            ->where('proposals.freelancer_id', $freelancerId)
            ->where('contracts.status', 'completed')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Projects Table
        |--------------------------------------------------------------------------
        */

        $projects = DB::table('proposals')
            ->join('projects', 'projects.id', '=', 'proposals.project_id')
            ->join('users as clients', 'clients.id', '=', 'projects.user_id')
            ->leftJoin('contracts', 'contracts.proposal_id', '=', 'proposals.id')
            ->where('proposals.freelancer_id', $freelancerId)
            ->where('proposals.status', 'accepted')
            ->select(
                'projects.id as project_id',
                'projects.title',
                'projects.budget_min',
                'projects.budget_max',
                'projects.created_at',
                'clients.username as client',
                'contracts.id as contract_id',
                'proposals.status as proposal_status',
                'contracts.status as contract_status'
            )
            ->orderBy('projects.created_at', 'desc')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'proposal_count' => $proposalCount,
            'accepted_proposals' => $acceptedProposals,
            'active_contracts' => $activeContracts,
            'completed_contracts' => $completedContracts,
            'projects' => $projects
        ]);
    }
}