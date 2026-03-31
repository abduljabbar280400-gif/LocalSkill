<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class WorkSubmittedNotification extends Notification
{
    use Queueable;

    protected $contract;

    public function __construct($contract)
    {
        $this->contract = $contract->load('project', 'freelancer');
    }

    public function via($notifiable)
    {
        return ['database',
        // 'mail'
        ]; // bell + email
    }

    public function toArray($notifiable)
    {
        $project = $this->contract->project;

        return [
            'type' => 'work_submitted',

            'message' => 'Freelancer submitted work',

            'project_title' => $project->title,

            'url' => '/hire-freelancer/'.$notifiable->username.'/projects'
        ];
    }

    public function toMail($notifiable)
    {
        $project = $this->contract->project;

        return (new MailMessage)
            ->subject('Freelancer Submitted Work')
            ->line('Your freelancer has submitted work for the project:')
            ->line($project->title)
            ->action('View Project', url('/projects/'.$project->slug))
            ->line('Please review the submitted work.');
    }
}