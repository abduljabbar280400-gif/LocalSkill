<?php

namespace App\Services;

use Google_Client;
use Google_Service_Calendar;
use Google_Service_Calendar_Event;

class GoogleMeetService
{
    protected $client;
    protected $calendarService;

    public function __construct()
    {
        $this->client = new Google_Client();

        $this->client->setAuthConfig(storage_path('app/google/meet-service-account.json'));

        $this->client->addScope(Google_Service_Calendar::CALENDAR);

        $this->calendarService = new Google_Service_Calendar($this->client);

        $this->client->setHttpClient(
    new \GuzzleHttp\Client([
        'verify' => false,
    ])
);
    }

    public function createMeetLink($summary = 'Project Meeting')
    {
        $event = new Google_Service_Calendar_Event([
            'summary' => $summary,
            'start' => [
                'dateTime' => now()->addMinutes(5)->toIso8601String(),
                'timeZone' => 'Asia/Kolkata',
            ],
            'end' => [
                'dateTime' => now()->addHours(1)->toIso8601String(),
                'timeZone' => 'Asia/Kolkata',
            ],
            'conferenceData' => [
                'createRequest' => [
                    'requestId' => uniqid(),
                    'conferenceSolutionKey' => [
                        'type' => 'hangoutsMeet',
                    ],
                ],
            ],
        ]);

        $calendarId = 'primary';

        $event = $this->calendarService->events->insert(
            $calendarId,
            $event,
            ['conferenceDataVersion' => 1]
        );

        return $event->getHangoutLink();
    }
}