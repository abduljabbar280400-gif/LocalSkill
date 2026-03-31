<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ProposalAcceptedNotification extends Notification
{
    use Queueable;

    protected $proposal;

    public function __construct($proposal)
    {
        $this->proposal = $proposal->load('project.user','contract');
    }

    public function via($notifiable)
    {
        return [
            // 'mail',
             'database'];
    }

    // Email Notification
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your Proposal Has Been Accepted')
            ->greeting('Hello ' . $notifiable->first_name)
            ->line('Good news! Your proposal has been accepted by the client.')
            ->line('Project ID: ' . $this->proposal->project_id)
            ->action('View Contract', url('/contracts/' . optional($this->proposal->contract)->id))
            ->line('Start working and communicate with the client.')
            ->line('Thank you for using our platform!');
    }

    // Website Notification
     public function toArray($notifiable)
{
    $project = $this->proposal->project;
    $client = $project->user;

    // Build client full name
    $clientName = trim(($client->first_name ?? '') . ' ' . ($client->last_name ?? ''));

    if (!$clientName) {
        $clientName = $client->username;
    }

    return [
        'type' => 'proposal_accepted',

        'message' => '🎉 Your proposal for was accepted',

        'project_title' => $project->title,

        'client_name' => $clientName,

        'project_slug' => $project->slug,

        'contract_id' => optional($this->proposal->contract)->id,

        // 'url' => '/projects/' . $project->slug,
        // 'url' => '/freelancer/mailtest/my-projects'
        
    ];
}
}