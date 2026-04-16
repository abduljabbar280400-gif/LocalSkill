<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Routing;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

use App\Http\Middleware\EnsureAdminAccess;
use App\Http\Middleware\EnsureUserIsActive;

use App\Providers\BroadcastServiceProvider;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
            \Illuminate\Support\Facades\RateLimiter::for('api', function (Request $request) {
                return Limit::perMinute(60)->by(
                    $request->user()?->id ?: $request->ip()
                );
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware) {

        $middleware->group('api', [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            // 'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'admin.secure' => EnsureAdminAccess::class,
            'user.active' => EnsureUserIsActive::class
        ]);
        $middleware->appendToGroup('api', [
        \Illuminate\Routing\Middleware\ThrottleRequests::class . ':60,1',
    ]);
        
    })
    ->withProviders([
        BroadcastServiceProvider::class,
    ])
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
