import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";
import "../../../utils/leafletIconFix";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { LuLocateFixed } from "react-icons/lu";

const DEFAULT_ZOOM = 15;
const DEFAULT_CENTER = [20.5937, 78.9629]; // Default center (India)

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
  readonly = false,
  interactiveOnClick = false,
  showDetectButton = true, // New prop
}) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastPostcodeRef = useRef(postcode);

  const [userActivated, setUserActivated] = useState(false);

  const isInteractive = readonly
    ? false
    : interactiveOnClick
      ? userActivated
      : true;

  useEffect(() => {
    async function resolveCenter() {
      setLoading(true);

      try {
        // 🔹 If postcode changed → reset marker
        if (postcode !== lastPostcodeRef.current) {
          setMarker(null); // clear old marker
          lastPostcodeRef.current = postcode; // update the ref
        }

        // 🔹 If latitude & longitude exist AND postcode unchanged → show saved marker
        if (
          latitude !== null &&
          longitude !== null &&
          postcode === lastPostcodeRef.current
        ) {
          setCenter([latitude, longitude]);
          setMarker([latitude, longitude]); // show saved marker
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
            }
          } catch (err) {
            console.error("Failed to resolve postcode:", err);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    resolveCenter();
  }, [postcode, latitude, longitude]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "LocalSkill/1.0",
          },
        },
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        return {
          postcode: addr.postcode || addr.zipcode || "",
          city:
            addr.city ||
            addr.town ||
            addr.village ||
            addr.suburb ||
            addr.city_district ||
            "",
          state: addr.state || "",
          country: addr.country || "",
          display_name: data.display_name,
        };
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
    return null;
  };

  const handleSelect = async (lat, lng, skipGeocode = false) => {
    setMarker([lat, lng]);
    let addressData = null;
    if (!skipGeocode) {
      addressData = await reverseGeocode(lat, lng);
    }
    onLocationSelect(lat, lng, addressData);
  };

  const handleDetect = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setCenter([lat, lng]);
        setMarker([lat, lng]);
        const addressData = await reverseGeocode(lat, lng);
        onLocationSelect(lat, lng, addressData);
        setLoading(false);
        setUserActivated(true);
        toast.success("Location detected!");
      },
      (error) => {
        setLoading(false);
        let msg = "Unable to retrieve your location.";
        if (error.code === 1) {
          msg = "Please turn on your location to auto-detect.";
        }
        toast.warn(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (loading) {
    return (
      <div style={{ height: "220px", width: "100%" }} className="relative z-0">
        <div className="loading-page" style={{ minHeight: "100%" }}>
          <div className="loading-spinner" />
          <p className="loading-text"> Loading... </p>
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

      {showDetectButton && !readonly && (
        <button
          type="button"
          onClick={handleDetect}
          title="Detect my location"
          className="absolute top-3 right-3 z-[1000] p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group active:scale-95"
        >
          <LuLocateFixed className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {interactiveOnClick && !isInteractive && (
        <div
          onClick={() => setUserActivated(true)}
          className="absolute inset-0 z-[1000] flex items-center justify-center cursor-pointer"
          style={{ background: "rgba(0,0,0,0.15)" }}
        >
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow text-sm font-medium">
            Click to explore map
          </div>
        </div>
      )}
    </div>
  );
}
