<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

use App\Models\Project;

class SyncProjectsLocation
{
    public function handle($event)
    {
        $user = $event->user;
        $profile = $event->profile;

        Project::where('user_id', $user->id)
            ->where('location_type', 'profile')
            ->update([
                'latitude' => $profile->latitude,
                'longitude' => $profile->longitude,
                'postal_code' => $profile->postcode,
            ]);
    }
}