<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClientProfile;
use App\Models\FreelancerProfile;
use App\Models\Conversation;
use App\Events\UserOnlineStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use App\Services\PublicUserCodeGenerator;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Fetch user including soft-deleted accounts so we can show a
        // meaningful error instead of "invalid credentials" for deleted users.
        $user = User::withTrashed()->where('email', $request->email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        if ($user->deleted_at) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deleted.'],
            ]);
        }

        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        if ($user->is_suspended) {
            return response()->json([
                'message' => 'Account suspended: ' . ($user->suspended_reason ?? 'Contact support'),
            ], 403);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Account is inactive'], 403);
        }

        $user->is_online = true;
        $user->last_seen = now('UTC');
        $user->save();

        broadcast(new UserOnlineStatus($user->id, true, $user->last_seen));

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user' => [
                'id'       => $user->id,
                'username' => $user->username,
                'email'    => $user->email,
                'role'     => $user->role,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Register Freelancer
    |--------------------------------------------------------------------------
    */
    public function registerFreelancer(Request $request): JsonResponse
    {
        return $this->registerUser($request, 'freelancer');
    }

    /*
    |--------------------------------------------------------------------------
    | Register Client
    |--------------------------------------------------------------------------
    */
    public function registerClient(Request $request): JsonResponse
    {
        return $this->registerUser($request, 'client');
    }

    /*
    |--------------------------------------------------------------------------
    | Shared Registration Logic
    |--------------------------------------------------------------------------
    */
    private function registerUser(Request $request, string $role): JsonResponse
    {
        $request->merge([
            'username' => strtolower($request->input('username')),
            'email'    => strtolower($request->input('email')),
            'phone'    => $this->normalizePhone($request->input('phone')),
        ]);

        $validated = $request->validate([
            'title'      => ['required', Rule::in(['Mr', 'Mrs', 'Ms', 'Dr'])],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'username'   => ['required', 'string', 'max:50', 'alpha_dash', 'unique:users,username'],
            'email'      => ['required', 'email', 'max:150', 'unique:users,email'],
            'phone'      => ['required', 'string', 'max:20', 'unique:users,phone'],
            'dob'        => ['required', 'date', 'before:today'],
            'password'   => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        return DB::transaction(function () use ($validated, $role) {
            $user = User::create([
                'public_user_code' => PublicUserCodeGenerator::generate(),
                'title'            => $validated['title'],
                'first_name'       => $validated['first_name'],
                'last_name'        => $validated['last_name'],
                'username'         => $validated['username'],
                'email'            => $validated['email'],
                'phone'            => $validated['phone'],
                'dob'              => $validated['dob'],
                'password'         => Hash::make($validated['password']),
                'role'             => $role,
                'is_active'        => true,
                'is_suspended'     => false,
            ]);

            if ($role === 'client') {
                ClientProfile::create([
                    'user_id'      => $user->id,
                    'company_name' => null,
                    'is_verified'  => false,
                ]);
            }

            if ($role === 'freelancer') {
                FreelancerProfile::create([
                    'user_id'             => $user->id,
                    'professional_title'  => 'New Freelancer',
                    'primary_category_id' => null,
                    'experience_level'    => 'beginner',
                    'onboarding_completed'=> false,
                    'profile_visibility'  => 'hidden',
                    'availability_status' => 'available',
                    'average_rating'      => 0,
                    'total_reviews'       => 0,
                    'completed_jobs'      => 0,
                ]);
            }

            // TODO: Replace with a queued mailable to avoid blocking the response.
            Mail::raw(
                "Hello {$user->first_name},\n\nWelcome to Local Skill Platform!\n\n"
                . "Your account has been successfully created.\n\nUsername: {$user->username}"
                . "\n\nThank you for joining us.",
                function ($message) use ($user) {
                    $message->to($user->email)->subject('Welcome to Local Skill Platform');
                }
            );

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'message'      => 'Registration successful',
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user' => [
                    'public_user_code' => $user->public_user_code,
                    'username'         => $user->username,
                    'email'            => $user->email,
                    'role'             => $user->role,
                ],
            ], 201);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */
    public function logout(Request $request): JsonResponse
    {
        $user      = $request->user();
        $nowCarbon = now();
        $lastSeenIso = $nowCarbon->toISOString();

        \Log::info("[Auth] User {$user->id} logging out. Setting is_online=false");
        
        User::where('id', $user->id)->update([
            'is_online' => false,
            'last_seen'  => $nowCarbon,
        ]);

        // Broadcast offline to every conversation BEFORE deleting the token.
        $conversationIds = Conversation::where('client_id', $user->id)
            ->orWhere('freelancer_id', $user->id)
            ->pluck('id');

        foreach ($conversationIds as $convId) {
            // Note: We used to broadcast per conversation, but now we use a global user.id channel.
            // Still, we might want to keep the conversation-level if needed, 
            // but for presence, one broadcast to user.{id} is enough.
        }
        
        try {
            // Fix: UserOnlineStatus takes (userId, isOnline, lastSeen)
            event(new UserOnlineStatus($user->id, false, $nowCarbon));
        } catch (\Throwable $e) {
            \Log::warning('[Auth] Offline broadcast failed: ' . $e->getMessage());
        }

        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    /*
    |--------------------------------------------------------------------------
    | Current Authenticated User (Client)
    |--------------------------------------------------------------------------
    */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $profile = ClientProfile::where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->first();

        return response()->json([
            'user'                 => $user,
            'profile'              => $profile,
            'is_profile_completed' => $profile?->is_profile_completed ?? false,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Phone Number
    |--------------------------------------------------------------------------
    */
    private function normalizePhone(?string $phone): ?string
    {
        if (! $phone) {
            return null;
        }

        $phone = preg_replace('/[^0-9+]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = substr($phone, 1);
        }

        if (! str_starts_with($phone, '+')) {
            $phone = '+91' . $phone;
        }

        return $phone;
    }
}
