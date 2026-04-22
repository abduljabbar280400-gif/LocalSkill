<?php

namespace App\Console\Commands;

use App\Events\UserOnlineStatus;
use App\Models\User;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CheckUserPresence extends Command
{
    protected $signature = 'app:check-user-presence';
    protected $description = 'Set users offline if they haven\'t sent a heartbeat recently.';

    public function handle()
    {
        // Users who are marked online but haven't been seen for more than 2 minutes
        $offlineThreshold = \Carbon\Carbon::now('UTC')->subMinutes(2);

        $users = User::where('is_online', true)
            ->where('last_seen', '<', $offlineThreshold)
            ->get();

        foreach ($users as $user) {
            $user->is_online = false;
            $user->save();

            broadcast(new UserOnlineStatus($user->id, false, $user->last_seen));
            $this->info("User {$user->id} set to offline (Last seen: {$user->last_seen}).");
        }

        return 0;
    }
}
