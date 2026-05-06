<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Contract;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\Conversation;

use App\Notifications\WorkSubmittedNotification;

class ContractController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | 1️⃣ Create Contract (Client)
    |--------------------------------------------------------------------------
    */
    public function create(Request $request, $username, $projectId)
    {
        $user = $request->user();

        $project = Project::findOrFail($projectId);

        if ($project->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'proposal_id' => 'required|exists:proposals,id',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }


        $existingContract = Contract::where('proposal_id', $request->proposal_id)->first();

    if ($existingContract) {
        return response()->json([
            'message'  => 'Contract already exists.',
            'contract' => $existingContract
        ], 200);
    }

        $proposal = Proposal::with('freelancer')
            ->where('id', $request->proposal_id)
            ->where('project_id', $project->id)
            ->firstOrFail();

        $contract = Contract::create([
            'project_id'        => $project->id,
            'client_id'         => $user->id,
            'freelancer_id'     => $proposal->freelancer_id,
            'proposal_id'       => $proposal->id,

            'agreed_amount'     => $proposal->proposed_amount,
            'proposal_amount'   => $proposal->proposed_amount,
            'proposal_duration' => $proposal->estimated_duration,

            'project_title'       => $project->title,
            'project_description' => $project->description,

            'client_name' =>
                $user->first_name . ' ' . $user->last_name,

            'freelancer_name' =>
                $proposal->freelancer->first_name . ' ' .
                $proposal->freelancer->last_name,

            'start_date'       => $request->start_date,
            'end_date'         => $request->end_date,
            'status'           => 'pending',

            'contract_number'  => Contract::generateContractNumber(),
        ]);

        // TODO: Notify freelancer via ProposalAcceptedNotification once notifications are set up
        Conversation::create([
            'contract_id' => $contract->id,
            'client_id' => $contract->client_id,
            'freelancer_id' => $contract->freelancer_id
        ]);

        return response()->json([
            'message'  => 'Contract created successfully.',
            'contract' => $contract
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ Accept Contract (Freelancer)
    |--------------------------------------------------------------------------
    */
    public function accept(Request $request, $username, $contractId)
{
    $user = $request->user();

    $contract = Contract::with(['project', 'proposal'])
        ->findOrFail($contractId);

    if ($contract->freelancer_id !== $user->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    if ($contract->status !== 'pending') {
        return response()->json([
            'message' => 'Only pending contracts can be accepted.'
        ], 400);
    }

    DB::transaction(function () use ($contract) {

        $contract->update([
            'status'                 => 'active',
            'freelancer_accepted'    => true,        // ✅ mark freelancer accepted
            'freelancer_accepted_at' => now(),       // ✅ store timestamp
        ]);

        $contract->project->update([
            'project_status' => 'in_progress'
        ]);

        $contract->proposal->update([
            'status' => 'accepted'
        ]);

        Proposal::where('project_id', $contract->project_id)
            ->where('id', '!=', $contract->proposal_id)
            ->update([
                'status' => 'rejected'
            ]);
    });

    return response()->json([
        'message' => 'Contract accepted. Project is now in progress.'
    ]);
}

/*
|--------------------------------------------------------------------------
| Submit Work (Freelancer)
|--------------------------------------------------------------------------
*/
public function submitWork(Request $request, $username, $contractId)
{
    $user = $request->user();

    $contract = Contract::findOrFail($contractId);

    if ($contract->freelancer_id !== $user->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    if ($contract->status !== 'active') {
        return response()->json([
            'message' => 'Only active contracts can submit work.'
        ], 400);
    }

    if ($contract->submitted_at !== null) {
        return response()->json([
            'message' => 'Work already submitted.'
        ], 400);
    }

    $validated = $request->validate([
        'submission_note' => 'required|string|max:2000'
    ]);

    $contract->update([
        'status'          => 'submitted',
        'submission_note' => $validated['submission_note'],
        'submitted_at'    => now(),   // ✅ store submission timestamp
    ]);

    $client = $contract->project->user;

    $client->notify(
        new WorkSubmittedNotification($contract)
    );

    return response()->json([
        'message' => 'Work submitted successfully.',
        'status'  => $contract->status,
    ]);
}

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ Complete Contract (Client)
    |--------------------------------------------------------------------------
    */
    public function complete(Request $request, $username, $contractId)
    {
        $user = $request->user();

        $contract = Contract::with('payments','project')->findOrFail($contractId);

        if ($contract->client_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($contract->status !== 'submitted') {
            return response()->json([
                'message' => 'Contract must be submitted before completion.'
            ], 400);
        }

        DB::transaction(function () use ($contract) {

            $contract->update([
                'status'       => 'completed',
                'completed_at' => now(),
            ]);

            $contract->project->update([
                'project_status' => 'closed'
            ]);

            foreach ($contract->payments as $payment) {

            if ($payment->freelancer_payout_status === 'pending') {

                $payment->update([
                    'freelancer_payout_status' => 'released',
                    'escrow_status' => 'released',
                    'payment_status' => 'paid', // final state
                ]);

                // ✅ Add earnings now (NOT before)
                $contract->total_freelancer_earnings += $payment->freelancer_earnings;
            }
        }

        $contract->save();

        });

        return response()->json([
            'message' => 'Contract completed successfully.',
            'contract' => $contract 
        ]);
    }

    /*
|--------------------------------------------------------------------------
| 5️⃣ Freelancer Contract List
|--------------------------------------------------------------------------
*/
public function freelancerContracts(Request $request, $username)
{
    $user = $request->user();

    return Contract::with('project')
        ->where('freelancer_id', $user->id)
        ->latest()
        ->get();
}

public function clientContracts(Request $request, $username)
{
    $user = $request->user();

    return response()->json([
        'contracts' => Contract::with(['project', 'freelancer'])
            ->where('client_id', $user->id)
            ->latest()
            ->get()
    ]);
}

public function approveAndComplete(Request $request, $username, $id)
{
    $contract = Contract::findOrFail($id);

    $contract->update([
        'status' => 'completed',
        'completed_at' => now(),
    ]);

    return response()->json([
        'message' => 'Contract approved and completed successfully'
    ]);
}
public function show($username, $contractId)
{
    $contract = Contract::findOrFail($contractId);

    return response()->json([
        'contract' => $contract
    ]);
}
public function showFreelancer(Request $request, $username, $contractId)
{
    $user = $request->user();

    // Ensure freelancer is accessing own contract
    if ($user->username !== $username) {
        return response()->json([
            'message' => 'Unauthorized'
        ], 403);
    }

    $contract = \App\Models\Contract::with([
        'project',
        'client'
    ])->where('id', $contractId)
      ->where('freelancer_id', $user->id)
      ->first();

    if (!$contract) {
        return response()->json([
            'message' => 'Contract not found'
        ], 404);
    }

    return response()->json([
        'contract' => $contract
    ]);
}

/*
|--------------------------------------------------------------------------
| 6️⃣ Send Contract for Re-Work (Client)
|--------------------------------------------------------------------------
*/
public function rework(Request $request, $username, $contractId)
{
    $user = $request->user();

    $contract = Contract::findOrFail($contractId);

    // Only client who owns the contract can send for rework
    if ($contract->client_id !== $user->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // Only submitted contracts can go for rework
    if ($contract->status !== 'submitted') {
        return response()->json([
            'message' => 'Only submitted contracts can be sent for rework.'
        ], 400);
    }

    $contract->update([
        'status' => 'pending',
        'completed_at' => null, // reset completed_at if any
        'submission_note'        => null,   // ✅ clear freelancer note
        'submitted_at'           => null,   // ✅ clear submission timestamp
        'freelancer_accepted'    => false,  // optional: reset acceptance
        'freelancer_accepted_at' => null,   // optional: reset acceptance timestamp
    ]);

    return response()->json([
        'message' => 'Contract sent for rework successfully.',
        'contract' => $contract
    ]);
}
public function index($username, $project)
{
    $contracts = Contract::where('project_id', $project)->get();

    return response()->json($contracts);
}
public function updateAmount(Request $request, $username, $contractId)
{
    $user = $request->user();

    $contract = Contract::findOrFail($contractId);

    // ✅ Only client can update
    if ($contract->client_id !== $user->id) {
        return response()->json([
            'message' => 'Unauthorized'
        ], 403);
    }

    // ✅ Only pending or active
    if (!in_array($contract->status, ['pending', 'active'])) {
        return response()->json([
            'message' => 'Cannot update amount at this stage'
        ], 400);
    }

    $validated = $request->validate([
        'agreed_amount' => 'required|numeric|min:1'
    ]);

    // ❌ Prevent reducing below already paid
    if ($validated['agreed_amount'] < $contract->total_paid) {
        return response()->json([
            'message' => 'Amount cannot be less than total paid',
            'total_paid' => $contract->total_paid
        ], 400);
    }

    $contract->update([
        'agreed_amount' => $validated['agreed_amount']
    ]);

    return response()->json([
        'message' => 'Agreed amount updated successfully',
        'contract' => $contract
    ]);
}
}