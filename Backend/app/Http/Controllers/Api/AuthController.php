<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClientProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

use App\Services\PublicUserCodeGenerator;

use App\Models\FreelancerProfile;



class AuthController extends Controller
{
    // -----------------------------------------------
    // LOGIN
    // -----------------------------------------------
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // ✅ Fetch user WITHOUT filtering deleted_at
        $user = User::withTrashed()->where('email', $request->email)->first();


        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        // ✅ Check if soft-deleted
        if ($user->deleted_at) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deleted.'],
            ]);
        }

        // ✅ Check password
        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        // ✅ Create token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    // -----------------------------------------------
    // REGISTER FREELANCER
    // -----------------------------------------------
    public function registerFreelancer(Request $request)
    {
        return $this->registerUser($request, 'freelancer');
    }

    // -----------------------------------------------
    // REGISTER CLIENT
    // -----------------------------------------------
    public function registerClient(Request $request)
    {
        return $this->registerUser($request, 'client');
    }

    // -----------------------------------------------
    // SHARED REGISTER LOGIC
    // -----------------------------------------------
    private function registerUser(Request $request, string $role)
    {
        $request->merge([
            'username' => strtolower($request->input('username')),
            'email' => strtolower($request->input('email')),
            'phone' => $this->normalizePhone($request->input('phone')),
        ]);

        $validated = $request->validate([
            'title' => ['required', Rule::in(['Mr', 'Mrs', 'Ms', 'Dr'])],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'username' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'dob' => ['required', 'date', 'before:today'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        return DB::transaction(function () use ($validated, $role) {

            $user = User::create([
                'public_user_code' => PublicUserCodeGenerator::generate(),
                'title' => $validated['title'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'dob' => $validated['dob'],
                'password' => Hash::make($validated['password']),
                'role' => $role,
                'is_active' => true,
                'is_suspended' => false,
            ]);

            // ✅ Create empty client profile only if role = client
            // ✅ Create client profile
if ($role === 'client') {
    ClientProfile::create([
        'user_id' => $user->id,
        'company_name' => null,
        'is_verified' => false,
    ]);
}

// ✅ Create freelancer profile automatically
if ($role === 'freelancer') {
    FreelancerProfile::create([
        'user_id' => $user->id,

        // Minimal defaults
        'professional_title' => 'New Freelancer',
        'primary_category_id' => null,
        'experience_level' => 'beginner',

        // System defaults
        'onboarding_completed' => false,
        'profile_visibility' => 'hidden',
        'availability_status' => 'available',

        // Stats
        'average_rating' => 0,
        'total_reviews' => 0,
        'completed_jobs' => 0,
    ]);
}

             Mail::raw(
            "Hello {$user->first_name},\n\nWelcome to Local Skill Platform!\n\nYour account has been successfully created.\n\nUsername: {$user->username}\n\nThank you for joining us.",
            function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Welcome to Local Skill Platform');
            }
        );

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'public_user_code' => $user->public_user_code,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ], 201);
        });
    }

    // -----------------------------------------------
    // LOGOUT
    // -----------------------------------------------
    public function logout(Request $request)
{
    $user = $request->user();

    // update last seen before logout
    $user->last_seen = now();
    $user->save();

    $user->currentAccessToken()->delete();

    return response()->json([
        'message' => 'Logged out'
    ]);
}

    // -----------------------------------------------
    // NORMALIZE PHONE
    // -----------------------------------------------
    private function normalizePhone(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        $phone = preg_replace('/[^0-9+]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = substr($phone, 1);
        }

        if (!str_starts_with($phone, '+')) {
            $phone = '+91' . $phone;
        }

        return $phone;
    }

    // -----------------------------------------------
    // FETCH AUTH USER
    // -----------------------------------------------
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $profile = ClientProfile::where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->first();

        return response()->json([
            'user' => $user,
            'profile' => $profile,
            'is_profile_completed' => $profile?->is_profile_completed ?? false,
        ]);
    }
}
