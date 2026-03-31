import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

const DEFAULT_ZOOM = 15;

function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]);

  return null;
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  postcode,
  latitude,
  longitude,
  onLocationSelect,
  readonly = false, // ✅ ADD THIS
  interactiveOnClick = false,
}) {
  const [center, setCenter] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastPostcode, setLastPostcode] = useState(postcode);

  // const [isInteractive, setIsInteractive] = useState(
  //   readonly ? false : !interactiveOnClick,
  // );

  const [userActivated, setUserActivated] = useState(false);

  const isInteractive = readonly
    ? false
    : interactiveOnClick
      ? userActivated
      : true;

  useEffect(() => {
    async function resolveCenter() {
      setLoading(true);

      // 🔹 If postcode changed → reset marker
      if (postcode !== lastPostcode) {
        setMarker(null); // clear old marker
        setLastPostcode(postcode); // update the ref
      }

      // 🔹 If latitude & longitude exist AND postcode unchanged → show saved marker
      if (
        latitude !== null &&
        longitude !== null &&
        postcode === lastPostcode
      ) {
        setCenter([latitude, longitude]);
        setMarker([latitude, longitude]); // show saved marker
        setLoading(false);
        return;
      }

      // 🔹 Always fetch map center based on current postcode
      if (postcode) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${postcode}`,
          );
          const data = await res.json();

          if (data.length) {
            const lat = +data[0].lat;
            const lng = +data[0].lon;
            setCenter([lat, lng]);
            // Marker remains null because user must pick a new location
            // setMarker(null); // require user to pick new marker
          }
        } catch (err) {
          console.error("Failed to resolve postcode:", err);
        }
      }
      // setUserActivated(false);

      setLoading(false);
    }

    resolveCenter();
  }, [postcode, latitude, longitude, lastPostcode]);

  const handleSelect = (lat, lng) => {
    setMarker([lat, lng]);
    onLocationSelect(lat, lng);
  };

  if (loading || !center) {
    return (
      <div style={{ height: "220px", width: "100%" }} className="relative z-0">
        <div className="loading-page" style={{ minHeight: "100%" }}>
          <div className="loading-spinner" />
          <p className="loading-text">Loading map…</p>
          <div
            className="loading-skeleton-row"
            style={{ width: "100%", maxWidth: 260 }}
          >
            <div className="loading-skeleton-strip" />
            <div className="loading-skeleton-strip" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "260px", width: "100%" }} className="relative">
      <MapContainer
        key={isInteractive ? "interactive" : "locked"} // ✅ FORCE RE-MOUNT
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        // ✅ Disable all interactions in readonly mode
        scrollWheelZoom={isInteractive}
        doubleClickZoom={isInteractive}
        dragging={isInteractive}
        zoomControl={isInteractive}
        touchZoom={isInteractive}
        boxZoom={isInteractive}
        keyboard={isInteractive}
      >
        <ChangeView center={center} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {marker && (
          <Marker
            position={marker}
            draggable={isInteractive} // ✅ disable drag
            eventHandlers={
              isInteractive
                ? {
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      handleSelect(lat, lng);
                    },
                  }
                : {}
            }
          />
        )}

        {isInteractive && <MapClickHandler onSelect={handleSelect} />}
      </MapContainer>

      {interactiveOnClick && !isInteractive && (
        <div
          onClick={() => setUserActivated(true)}
          className="absolute inset-0 z-[1000] flex items-center justify-center cursor-pointer"
          style={{ background: "rgba(0,0,0,0.15)" }}
        >
          <div className="bg-white px-4 py-2 rounded-lg shadow text-sm font-medium">
            Click to explore map
          </div>
        </div>
      )}
    </div>
  );
}
