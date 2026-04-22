<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

use App\Http\Middleware\EnsureAdminAccess;
use App\Http\Middleware\EnsureUserIsActive;
use App\Providers\BroadcastServiceProvider;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__ . '/../routes/web.php',
        api:      __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health:   '/up',
        then: function () {
            // Custom API rate-limit: 60 requests/minute per authenticated user or IP
            \Illuminate\Support\Facades\RateLimiter::for('api', function (Request $request) {
                return Limit::perMinute(60)->by(
                    $request->user()?->id ?: $request->ip()
                );
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware) {

        // API middleware stack
        $middleware->group('api', [
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        // Named middleware aliases
        $middleware->alias([
            'role'         => \App\Http\Middleware\RoleMiddleware::class,
            'admin.secure' => EnsureAdminAccess::class,
            'user.active'  => EnsureUserIsActive::class,
        ]);

        // Append throttle (60 req/min) to every API request
        $middleware->appendToGroup('api', [
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':60,1',
        ]);

        $middleware->validateCsrfTokens(except: [
            'api/broadcasting/auth',
        ]);
    })

    ->withProviders([
        BroadcastServiceProvider::class,
    ])
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
