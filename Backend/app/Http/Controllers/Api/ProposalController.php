<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Proposal;
use Illuminate\Http\Request;

use App\Models\User;
use App\Notifications\ProposalAcceptedNotification;
use App\Notifications\NewProposalReceivedNotification;

class ProposalController extends Controller
{
    /**
     * Store a newly created proposal.
     */
    public function store(Request $request, Project $project)
    {
        $user = $request->user();

        // 🔐 Ensure user is authenticated
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // 🔐 Only freelancers can apply
        if ($user->role !== 'freelancer') {
            return response()->json([
                'message' => 'Only freelancers can submit proposals.'
            ], 403);
        }

        // 🔐 Prevent applying to own project
        if ($project->user_id === $user->id) {
            return response()->json([
                'message' => 'You cannot apply to your own project.'
            ], 403);
        }

        // ✅ Validate input
        $validated = $request->validate([
            'cover_letter'       => 'required|string',
            'proposed_amount'    => 'required|numeric|min:1',
            'estimated_duration' => 'nullable|string|max:100',

            'attachment_file' => 'nullable|file|mimes:pdf,doc,docx,jpg,png,zip|max:5120',
            'attachment_link' => 'nullable|url',
        ]);

        // 🔁 Prevent duplicate proposal
        $alreadyApplied = Proposal::where('project_id', $project->id)
            ->where('freelancer_id', $user->id)
            ->exists();

        if ($alreadyApplied) {
            return response()->json([
                'message' => 'You have already submitted a proposal.'
            ], 422);
        }

        $attachmentPath = null;

if ($request->hasFile('attachment_file')) {
    $attachmentPath = $request->file('attachment_file')
        ->store('proposal_attachments', 'public');
}

        // 📝 Create proposal
        $proposal = Proposal::create([
            'project_id'         => $project->id,
            'freelancer_id'      => $user->id,
            'cover_letter'       => $validated['cover_letter'],
            'proposed_amount'    => $validated['proposed_amount'],
            'estimated_duration' => $validated['estimated_duration'] ?? null,
            'attachment_file'    => $attachmentPath,
            'attachment_link'    => $validated['attachment_link'] ?? null,
            'status'             => 'pending',
        ]);

        $client = $project->user;

        $client->notify(new NewProposalReceivedNotification($proposal));

        return response()->json([
            'message' => 'Proposal has been submitted'
        ], 201);
    }

     public function updateStatus(Request $request, Proposal $proposal)
    {
        $request->validate([
            'status' => 'required|in:pending,shortlisted,accepted,rejected'
        ]);

        $proposal->update([
            'status' => $request->status
        ]);

        // 🚀 Send notification if accepted
    if ($request->status === 'accepted') {
        $freelancer = $proposal->freelancer;

        $freelancer->notify(new ProposalAcceptedNotification($proposal));
        
    }

        return response()->json([
            'message' => 'Proposal status updated successfully',
            'proposal' => $proposal
        ]);
    }
}