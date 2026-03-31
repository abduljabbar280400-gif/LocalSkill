<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewProposalReceivedNotification extends Notification
{
    use Queueable;

    protected $proposal;

    public function __construct($proposal)
    {
        $this->proposal = $proposal->load('project', 'freelancer');
    }

    public function via($notifiable)
    {
        return ['database']; // bell only
    }

    public function toArray($notifiable)
    {
        $project = $this->proposal->project;
        $freelancer = $this->proposal->freelancer;

        return [
            'type' => 'new_proposal',

            'message' => 'New proposal received',

            'project_title' => $project->title,

            'freelancer_name' => $freelancer->username,

            'project_slug' => $project->slug,

            'url' => '/hire-freelancer/'.$notifiable->username.'/projects'
        ];
    }
}