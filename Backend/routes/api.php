<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Artisan;

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
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\FreelancerController;
use App\Http\Controllers\SavedFreelancerController;
use App\Http\Controllers\SavedProjectController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminFreelancerController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;

use App\Services\GoogleMeetService;

/*
|--------------------------------------------------------------------------
| Debug / Dev-Only Routes
| These are only registered in the local environment.
|--------------------------------------------------------------------------
*/
if (app()->environment('local')) {

    Route::get('/routes', function () {
        return collect(Route::getRoutes())->map(fn ($r) => [
            'uri'     => $r->uri(),
            'methods' => $r->methods(),
        ]);
    });

    Route::get('/ping', fn () => response()->json(['status' => 'ok', 'time' => now()]));

    Route::get('/run-migrate', function () {
        Artisan::call('migrate', ['--force' => true]);
        return 'Migration Done';
    });

    Route::get('/test-email', function () {
        Mail::raw('This is a test email from Local Skill Platform', function ($message) {
            $message->to('test@example.com')->subject('Test Email');
        });
        return 'Email Sent!';
    });

    Route::get('/test-meet', function (GoogleMeetService $meetService) {
        $link = $meetService->createMeetLink('Test Meeting');
        return response()->json(['meet_link' => $link]);
    });
}

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/categories',                    [CategoryController::class,        'index']);
Route::get('/categories/{category}/skills',  [SkillController::class,           'byCategory']);
Route::get('/skills',                        [SkillController::class,           'index']);
Route::post('/login',                        [AuthController::class,            'login']);

Route::get('/projects',                      [ProjectController::class,         'index']);
Route::get('/projects/nearby',               [ProjectController::class,         'nearbyProjects']);
Route::get('/projects/{slug}/related',       [ProjectController::class,         'related']);
Route::get('/projects/{slug}',               [ProjectController::class,         'show']);

Route::get('/location/from-postal',          [LocationController::class,        'getLatLng']);
Route::get('/location/from-coordinates',     [LocationController::class,        'getCity']);

Route::get('/freelancers',                   [FreelancerController::class,      'index']);
Route::get('/freelancers/top',               [FreelancerController::class,      'topFreelancers']);
Route::get('/freelancer/{username}/profile', [FreelancerProfileController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Client – Public (Registration / Availability Checks)
|--------------------------------------------------------------------------
*/
Route::prefix('hire-freelancer')->group(function () {
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/register',        [AuthController::class, 'registerClient']);
    Route::get('/check-username',   [UserController::class, 'checkUsername']);
    Route::get('/check-email',      [UserController::class, 'checkEmail']);
    Route::get('/check-phone',      [UserController::class, 'checkPhone']);
});

/*
|--------------------------------------------------------------------------
| Client – Protected
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'user.active', 'role:client'])->group(function () {
    Route::post('/hire-freelancer/logout', [AuthController::class, 'logout']);
    Route::get('/hire-freelancer/me',      [AuthController::class, 'me']);

    // Dashboard
    Route::get('/hire-freelancer/{username}/dashboard',       [ClientDashboardController::class, 'index']);
    Route::get('/hire-freelancer/{username}/dashboard-extra', [ClientDashboardController::class, 'extra']);

    // Profile
    Route::get('/hire-freelancer/{username}/profile',  [ClientProfileController::class, 'show']);
    Route::put('/hire-freelancer/{username}/profile',  [ClientProfileController::class, 'update']);
    Route::delete('/hire-freelancer/{username}',       [ClientProfileController::class, 'destroy']);

    // Projects
    Route::post('/hire-freelancer/{username}/projects',                        [ProjectController::class, 'store']);
    Route::get('/hire-freelancer/{username}/projects',                         [ProjectController::class, 'clientProjects']);
    Route::get('/hire-freelancer/{username}/projects/{project}',               [ProjectController::class, 'showClientProject']);
    Route::put('/hire-freelancer/{username}/projects/{project}',               [ProjectController::class, 'update']);
    Route::delete('/hire-freelancer/{username}/projects/{project}',            [ProjectController::class, 'destroy']);
    Route::get('/hire-freelancer/{username}/projects/{project}/proposals',     [ProjectController::class, 'viewProjectProposals']);

    // Proposals
    Route::put('/proposals/{proposal}', [ProposalController::class, 'updateStatus']);

    // Contracts
    Route::post('/hire-freelancer/{username}/projects/{project}/contracts',           [ContractController::class, 'create']);
    Route::get('/hire-freelancer/{username}/projects/{project}/contracts',            [ContractController::class, 'index']);
    Route::get('/hire-freelancer/{username}/contracts/{contract}',                    [ContractController::class, 'show']);
    Route::post('/hire-freelancer/{username}/contracts/{contract}/approve-complete',  [ContractController::class, 'approveAndComplete']);
    Route::put('/hire-freelancer/{username}/contracts/{contract}/amount',             [ContractController::class, 'updateAmount']);
    Route::post('/hire-freelancer/{username}/contracts/{contractId}/accept',          [ContractController::class, 'acceptContract']);
    Route::post('/hire-freelancer/{username}/contracts/{contractId}/submit',          [ContractController::class, 'submitWork']);
    Route::post('/hire-freelancer/{username}/contracts/{contractId}/complete',        [ContractController::class, 'complete']);
    Route::put('/hire-freelancer/{username}/contracts/{contractId}/rework',           [ContractController::class, 'rework']);
    Route::post('/hire-freelancer/{username}/contracts/{contract}/review',            [ReviewController::class, 'store']);

    // Payments
    Route::post('/hire-freelancer/{username}/contracts/{id}/payments', [PaymentController::class, 'store']);
    Route::get('/hire-freelancer/{username}/contracts/{id}/payments', [PaymentController::class, 'index']);

    // Saved freelancers
    Route::get('/hire-freelancer/{username}/saved-freelancers', [SavedFreelancerController::class, 'details']);
});

/*
|--------------------------------------------------------------------------
| Freelancer – Public (Registration / Availability Checks)
|--------------------------------------------------------------------------
*/
Route::prefix('freelancer')->group(function () {
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/register',        [AuthController::class, 'registerFreelancer']);
    Route::get('/check-username',   [UserController::class, 'checkUsername']);
    Route::get('/check-email',      [UserController::class, 'checkEmail']);
    Route::get('/check-phone',      [UserController::class, 'checkPhone']);
});

/*
|--------------------------------------------------------------------------
| Freelancer – Protected
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'user.active', 'role:freelancer'])->group(function () {
    Route::post('/freelancer/logout', [AuthController::class, 'logout']);

    Route::get('/freelancer/{username}/my-profile',    [FreelancerProfileController::class, 'myProfile']);
    Route::put('/freelancer/{username}/edit-profile',  [FreelancerProfileController::class, 'update']);
    Route::post('/freelancer/{username}/my-profile/complete', [FreelancerProfileController::class, 'complete']);
    Route::delete('/freelancer/{username}',            [FreelancerProfileController::class, 'destroy']);

    // Skills
    Route::get('/freelancer/{username}/skills',                    [FreelancerSkillController::class, 'index']);
    Route::post('/freelancer/{username}/skills',                   [FreelancerSkillController::class, 'store']);
    Route::put('/freelancer/{username}/skills/{skillId}',          [FreelancerSkillController::class, 'update']);
    Route::delete('/freelancer/{username}/skills/{skillId}',       [FreelancerSkillController::class, 'destroy']);

    // Proposals (auth-only submission)
    Route::post('/projects/{project}/proposals', [ProposalController::class, 'store']);

    // My projects & contracts
    Route::get('/freelancer/{username}/my-projects',               [FreelancerProjectController::class, 'index']);
    Route::get('/freelancer/{username}/contracts',                  [ContractController::class, 'freelancerContracts']);
    Route::get('/freelancer/{username}/contracts/{contract}',       [ContractController::class, 'showFreelancer']);
    Route::post('/freelancer/{username}/contracts/{contract}/accept',       [ContractController::class, 'accept']);
    Route::post('/freelancer/{username}/contracts/{contract}/submit-work',  [ContractController::class, 'submitWork']);

    // Dashboard
    Route::get('/freelancer/{username}/dashboard', [FreelancerDashboardController::class, 'index']);
    Route::get('/freelancer/{username}/earnings', [PaymentController::class, 'freelancerEarnings']);

    // Current user shortcut
    Route::get('/freelancer/me', fn (Request $request) => $request->user());
});

/*
|--------------------------------------------------------------------------
| Chat & Notifications (Client + Freelancer)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'user.active'])->group(function () {
    // Chat
    Route::get('/conversations',                               [ChatController::class, 'getUserConversations']);
    Route::get('/conversations/unread-count',                  [ChatController::class, 'unreadCount']);
    Route::get('/contracts/{contractId}/conversation',         [ChatController::class, 'getConversation']);
    Route::get('/conversations/{conversationId}/messages',     [ChatController::class, 'getMessages']);
    Route::post('/conversations/{conversationId}/send',        [ChatController::class, 'sendMessage']);
    Route::post('/conversations/{conversationId}/delivered',   [ChatController::class, 'markDelivered']);
    Route::post('/conversations/{conversationId}/seen',        [ChatController::class, 'markSeen']);
    Route::post('/user/heartbeat',                             [ChatController::class, 'updateLastSeen']);
    Route::post('/chat/typing',                                [ChatController::class, 'typing']);
    Route::post('/chat/online',                                [ChatController::class, 'setOnline']);
    Route::post('/chat/offline',                               [ChatController::class, 'setOffline']);
    Route::post('/chat/global-online',                         [ChatController::class, 'setGlobalOnline']);
    Route::post('/chat/global-offline',                        [ChatController::class, 'setGlobalOffline']);

    // Notifications
    Route::get('/notifications',                   [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count',      [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read',        [NotificationController::class, 'markAsRead']);

    // Saved items
    Route::get('/saved-freelancers',               [SavedFreelancerController::class, 'index']);
    Route::post('/saved-freelancers/{id}',         [SavedFreelancerController::class, 'store']);
    Route::delete('/saved-freelancers/{id}',       [SavedFreelancerController::class, 'destroy']);

    Route::get('/saved-projects',                  [SavedProjectController::class, 'index']);
    Route::post('/saved-projects/{projectId}',     [SavedProjectController::class, 'toggle']);
});

// Beacon route for setting offline status when page is closed. This cannot use auth:sanctum
// because navigator.sendBeacon doesn't send Bearer tokens in the header.
Route::post('/chat/global-offline-beacon', [ChatController::class, 'setGlobalOfflineBeacon']);

/*
|--------------------------------------------------------------------------
| Admin – Protected
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'user.active', 'admin.secure'])
    ->prefix('control-center/internal')
    ->group(function () {
        Route::get('/dashboard',              [AdminDashboardController::class,  'index']);
        Route::get('/users',                  [AdminUserController::class,       'index']);
        Route::patch('/users/{id}/suspend',   [AdminUserController::class,       'suspend']);
        Route::patch('/users/{id}/unsuspend', [AdminUserController::class,       'unsuspend']);
        Route::get('/freelancers/pending',    [AdminFreelancerController::class, 'pending']);
        Route::patch('/freelancers/{id}/approve', [AdminFreelancerController::class, 'approve']);
        Route::patch('/freelancers/{id}/reject',  [AdminFreelancerController::class, 'reject']);
        Route::patch('/freelancers/{id}/unverify', [AdminFreelancerController::class, 'unverify']);
    });