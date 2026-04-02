<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Illuminate\Support\Facades\Event;
use App\Events\ProfileLocationUpdated;
use App\Listeners\SyncProjectsLocation;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
{
    Event::listen(
        ProfileLocationUpdated::class,
        SyncProjectsLocation::class
    );
    if (env('APP_ENV') === 'production') {
        URL::forceScheme('https');
    }
}
}
