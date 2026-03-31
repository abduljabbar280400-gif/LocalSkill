<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LocationController extends Controller
{
    public function getLatLng(Request $request)
{
    $request->validate([
        'postal_code' => 'required'
    ]);

    $postal = $request->postal_code;

    // Using OpenStreetMap (FREE)
    $response = Http::get("https://nominatim.openstreetmap.org/search", [
        'postalcode' => $postal,
        'country' => 'India',
        'format' => 'json'
    ]);

    if (!$response->ok() || empty($response->json())) {
        return response()->json([
            'success' => false,
            'message' => 'Location not found'
        ], 404);
    }

    $data = $response->json()[0];

    return response()->json([
        'success' => true,
        'lat' => $data['lat'],
        'lng' => $data['lon']
    ]);
}

public function getCity(Request $request)
{
    $request->validate([
        'lat' => 'required',
        'lng' => 'required',
    ]);

    $response = Http::get("https://nominatim.openstreetmap.org/reverse", [
        'lat' => $request->lat,
        'lon' => $request->lng,
        'format' => 'json'
    ]);

    if (!$response->ok()) {
        return response()->json([
            'success' => false,
            'message' => 'Unable to fetch location'
        ], 500);
    }

    $data = $response->json();

    $city =
        $data['address']['city'] ??
        $data['address']['town'] ??
        $data['address']['village'] ??
        'Unknown';

    return response()->json([
        'success' => true,
        'city' => $city
    ]);
}
}
