<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\FreelancerProfileController;
use App\Http\Controllers\Api\FreelancerSkillController;
use App\Http\Controllers\Api\ClientDashboardController;
use App\Http\Controllers\Api\Freelancer\FreelancerDashboardController;
use App\Http\Controllers\Api\ClientProfileController;
use App\Http\Controllers\Api\Client\ProjectController;
use App\Http\Controllers\Api\ProposalController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\Freelancer\FreelancerProjectController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\FreelancerController;


use Illuminate\Support\Facades\Mail;

use App\Services\GoogleMeetService;

Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'time' => now()
    ]);
});


Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}/skills', [SkillController::class, 'byCategory']);
Route::get('/skills', [SkillController::class, 'index']);
Route::post('/login', [AuthController::class, 'login']); 

Route::post('/projects/{project}/proposals', [ProjectController::class, 'store']);

Route::get('/projects/{slug}/related', [ProjectController::class, 'related']);
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/nearby', [ProjectController::class, 'nearbyProjects']);
Route::get('/projects/{slug}', [ProjectController::class, 'show']);

Route::get('/location/from-postal', [LocationController::class, 'getLatLng']);
Route::get('/location/from-coordinates', [LocationController::class, 'getCity']);

Route::get('/freelancer/{username}/profile', [FreelancerProfileController::class, 'show']);
Route::get('/freelancers/top', [FreelancerController::class, 'topFreelancers']);



// Client
Route::prefix('hire-freelancer')->group(function () {

    Route::post('/login', [AuthController::class, 'login']); 
    Route::post('/register', [AuthController::class, 'registerClient']);
    Route::get('/check-username', [UserController::class, 'checkUsername']);
    Route::get('/check-email', [UserController::class, 'checkEmail']);
    Route::get('/check-phone', [UserController::class, 'checkPhone']);
});

Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    Route::post('/hire-freelancer/logout', [AuthController::class, 'logout']);
// Client Dashboard
    Route::get('/hire-freelancer/{username}/dashboard',[ClientDashboardController::class, 'index']);
    Route::get('/hire-freelancer/{username}/dashboard-extra', [ClientDashboardController::class, 'extra']);
    Route::post('/contracts/{id}/pay', [DashboardController::class, 'payContract']);

    Route::get('/hire-freelancer/{username}/profile', [ClientProfileController::class, 'show']);
    Route::put('/hire-freelancer/{username}/profile', [ClientProfileController::class, 'update']);

    Route::delete('/hire-freelancer/{username}', [ClientProfileController::class, 'destroy']);

    // Prject Controller
    Route::post('/hire-freelancer/{username}/projects', [ProjectController::class, 'store']);
    Route::get('/hire-freelancer/{username}/projects', [ProjectController::class, 'clientProjects']);
    Route::put('/hire-freelancer/{username}/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/hire-freelancer/{username}/projects/{project}',[ProjectController::class, 'destroy']);
    Route::get('/hire-freelancer/{username}/projects/{project}/proposals',[ProjectController::class, 'viewProjectProposals']);

    Route::get('/hire-freelancer/{username}/projects/{project}', [ProjectController::class, 'showClientProject']);

    //Proposal
    Route::put('/proposals/{proposal}', [ProposalController::class, 'updateStatus']);

    //Contract
    Route::post('/hire-freelancer/{username}/projects/{project}/contracts',[ContractController::class, 'create']);
    Route::get('/hire-freelancer/{username}/projects/{project}/contracts',[ContractController::class,'index']);
    Route::get('/hire-freelancer/{username}/contracts/{contract}',[ContractController::class, 'show']);
    Route::post('/hire-freelancer/{username}/contracts/{contract}/approve-complete',[ContractController::class, 'approveAndComplete']);
    Route::put('/hire-freelancer/{username}/contracts/{contract}/amount', [ContractController::class, 'updateAmount']);
    
    Route::post('/hire-freelancer/{username}/contracts/{contractId}/accept',[ContractController::class, 'acceptContract']);
    Route::post('/hire-freelancer/{username}/contracts/{contractId}/submit',[ContractController::class, 'submitWork']);
    Route::post('/hire-freelancer/{username}/contracts/{contractId}/complete',[ContractController::class, 'complete']);
    Route::put('/hire-freelancer/{username}/contracts/{contractId}/rework',[ContractController::class, 'rework']);
    Route::post('/hire-freelancer/{username}/contracts/{contract}/review', [ReviewController::class, 'store']);


    

    Route::get('/hire-freelancer/me', [AuthController::class, 'me']);


});




// Freelancer
Route::prefix('freelancer')->group(function () {

    // Public
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'registerFreelancer']);

    Route::get('/check-username', [UserController::class, 'checkUsername']);
    Route::get('/check-email', [UserController::class, 'checkEmail']);
    Route::get('/check-phone', [UserController::class, 'checkPhone']);
});

    // Protected
    Route::middleware(['auth:sanctum', 'role:freelancer'])->group(function () {

        Route::post('/freelancer/logout', [AuthController::class, 'logout']);

        // Freelancer Profile Onboarding (Username-based)

        // Route::get('/freelancer/{username}/profile', [FreelancerProfileController::class, 'show']);
       Route::get('/freelancer/{username}/my-profile', [FreelancerProfileController::class, 'myProfile']);
        
       // Route::post('/freelancer/{username}/my-profile', [FreelancerProfileController::class, 'store']); -------------Delete

        
        Route::put('/freelancer/{username}/edit-profile', [FreelancerProfileController::class, 'update']);


        Route::post('/freelancer/{username}/my-profile/complete', [FreelancerProfileController::class, 'complete']);
        Route::delete('/freelancer/{username}', [FreelancerProfileController::class, 'destroy']);
        // Skills
        Route::get('/freelancer/{username}/skills', [FreelancerSkillController::class, 'index']);
        Route::post('/freelancer/{username}/skills', [FreelancerSkillController::class, 'store']);
        Route::put('/freelancer/{username}/skills/{skillId}', [FreelancerSkillController::class, 'update']);
        Route::delete('/freelancer/{username}/skills/{skillId}', [FreelancerSkillController::class, 'destroy']);
        // Route::get('/freelancer/{username}/dashboard',[FreelancerDashboardController::class, 'index']);

        //Proposal
        Route::post('/projects/{project}/proposals', [ProposalController::class, 'store']);
        //My-Project
        Route::get('/freelancer/{username}/my-projects',[FreelancerProjectController::class, 'index']);

        //Contract
        Route::get('/freelancer/{username}/contracts',[ContractController::class, 'freelancerContracts']);
        //Single Contract
        Route::get('/freelancer/{username}/contracts/{contract}',[ContractController::class, 'showFreelancer']);
        //Accpet
        Route::post('/freelancer/{username}/contracts/{contract}/accept',[ContractController::class, 'accept']);
        Route::post('/freelancer/{username}/contracts/{contract}/submit-work',[ContractController::class, 'submitWork']);
        
        
        Route::get('/freelancer/{username}/dashboard',[FreelancerDashboardController::class, 'index']);


        // Temporary test
        Route::get('/freelancer/me', function (Request $request) {
        return $request->user();
    });
});


/*
|--------------------------------------------------------------------------
| Chat (Client + Freelancer)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/contracts/{contract}/conversation', [ChatController::class, 'getConversation']);
    Route::get('/conversations/{conversation}/messages', [ChatController::class, 'getMessages']);
    Route::post('/conversations/{conversation}/send', [ChatController::class, 'sendMessage']);
    Route::post('/chat/last-seen', [ChatController::class, 'updateLastSeen']);


    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

});



//  MAIL 
Route::get('/test-email', function () {

    Mail::raw('This is a test email from Local Skill Platform', function ($message) {
        $message->to('test@example.com')
                ->subject('Test Email');
    });

    return "Email Sent!";
});



Route::get('/test-meet', function (GoogleMeetService $meetService) {
    $link = $meetService->createMeetLink('Test Meeting');

    return response()->json([
        'meet_link' => $link
    ]);
});