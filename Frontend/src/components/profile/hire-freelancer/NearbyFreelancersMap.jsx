import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { renderToString } from "react-dom/server";
import { FaMapMarkerAlt, FaUserTie } from "react-icons/fa";
import { useEffect } from "react";

// ✅ Convert React Icon → HTML (VERY IMPORTANT)
const createIcon = (icon, color = "blue") =>
  L.divIcon({
    html: renderToString(<div style={{ color, fontSize: "24px" }}>{icon}</div>),
    className: "",
    iconSize: [30, 30],
  });

// 📍 Icons
const userIcon = createIcon(<FaMapMarkerAlt />, "red");
const freelancerIcon = createIcon(<FaUserTie />, "#2563eb");

// 🎯 Zoom based on radius
const getZoomLevel = (radius) => {
  if (radius <= 5) return 15;
  if (radius <= 10) return 13;
  if (radius <= 20) return 12;
  return 10;
};

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

  return (
    <div className="mt-10 rounded-2xl overflow-hidden shadow-md">
      <MapContainer
        center={[userLocation.lat, userLocation.lon]}
        zoom={15}
        className="h-[400px] w-full"
        /* 🔒 DISABLE ALL INTERACTIONS */
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <MapUpdater userLocation={userLocation} radius={radius} />
        {/* 🌍 Map tiles */}
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 📍 USER */}
        <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
          <Popup>
            <div>You are here</div>
          </Popup>
        </Marker>

        {/* 🧑‍💼 Freelancer Markers */}
        {freelancers.map((f) => {
          if (!f.latitude || !f.longitude) return null;

          return (
            <Marker
              key={f.id}
              position={[parseFloat(f.latitude), parseFloat(f.longitude)]}
              icon={freelancerIcon}
            >
              <Popup>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm">
                    {f.first_name} {f.last_name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    {f.professional_title}
                  </p>

                  <p className="text-xs">
                    💰 {f.currency} {f.hourly_rate}/hr
                  </p>

                  <p className="text-xs text-green-600">
                    📍 {f.distance?.toFixed(1)} km
                  </p>

                  <Link
                    to={`/freelancer/${f.username}`}
                    className="text-blue-600 text-xs underline"
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
