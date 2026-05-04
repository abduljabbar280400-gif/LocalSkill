import "leaflet/dist/leaflet.css";
import "../../../utils/leafletIconFix";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

import L from "leaflet";
import { renderToString } from "react-dom/server";
import { FaMapMarkerAlt, FaUserTie, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect } from "react";

// 🎯 ICON BUILDER
const createIcon = (content) =>
  L.divIcon({
    html: renderToString(content),
    className: "",
    iconSize: [40, 40],
  });

// 📍 USER ICON (highlighted)
const userIcon = createIcon(
  <div className="bg-red-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
    <FaMapMarkerAlt />
  </div>,
);

// 🧑 FREELANCER ICON
const freelancerIcon = createIcon(
  <div className="bg-blue-600 text-white p-2 rounded-full shadow-md border border-white">
    <FaUserTie />
  </div>,
);

// ⭐ BEST FREELANCER ICON
const bestIcon = createIcon(
  <div className="bg-yellow-400 text-white p-2 rounded-full shadow-xl border-2 border-white">
    <FaStar />
  </div>,
);

// 🎯 ZOOM LOGIC
const getZoomLevel = (radius) => {
  if (radius <= 5) return 15;
  if (radius <= 10) return 13;
  if (radius <= 20) return 12;
  return 10;
};

// 🔄 MAP CONTROL
function MapUpdater({ userLocation, radius }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation) return;

    const zoom = getZoomLevel(radius);

    map.setView([userLocation.lat, userLocation.lon], zoom, {
      animate: true,
    });
  }, [radius, userLocation, map]);

  return null;
}

export default function NearbyFreelancersMap({
  userLocation,
  freelancers,
  radius,
}) {
  if (!userLocation) return null;

  // 🟢 Best freelancer (nearest)
  const bestFreelancer = freelancers[0];

  return (
    <div className="mt-10 rounded-2xl overflow-hidden shadow-lg">
      <MapContainer
        center={[userLocation.lat, userLocation.lon]}
        zoom={13}
        className="h-[420px] w-full"
        // 🔒 READ ONLY MAP
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <MapUpdater userLocation={userLocation} radius={radius} />

        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🌫️ PREMIUM OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent pointer-events-none z-[400]" />

        {/* 📍 USER */}
        <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
          <Popup>
            <div className="text-sm font-medium">You are here</div>
          </Popup>
        </Marker>

        {/* 🧑 FREELANCERS */}
        {freelancers.map((f) => {
          if (!f.latitude || !f.longitude) return null;

          const isBest = bestFreelancer?.id === f.id;

          return (
            <Marker
              key={f.id}
              position={[parseFloat(f.latitude), parseFloat(f.longitude)]}
              icon={isBest ? bestIcon : freelancerIcon}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <h3 className="font-semibold">
                    {f.first_name} {f.last_name}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {f.professional_title}
                  </p>

                  <p className="text-xs">
                    💰 {f.currency} {f.hourly_rate}/hr
                  </p>

                  <p className="text-xs text-green-600">
                    📍 {f.distance?.toFixed(1)} km away
                  </p>

                  {isBest && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      ⭐ Best Match
                    </span>
                  )}

                  <Link
                    to={`/freelancer/${f.username}`}
                    className="block mt-2 text-center bg-blue-600 text-white py-1 rounded text-xs"
                  >
                    View Profile
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
