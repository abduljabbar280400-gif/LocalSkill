import { useEffect, useState } from "react";
import axios from "../../../services/api";
import { Link } from "react-router-dom";
import NearbyFreelancersMap from "./NearbyFreelancersMap";

export default function NearbyFreelancers() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(10);
  const [city, setCity] = useState("");

  // 📍 Get location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );
  }, []);

  // 🔄 Fetch data
  useEffect(() => {
    if (userLocation) {
      fetchFreelancers(userLocation.lat, userLocation.lon);
      fetchCity(userLocation.lat, userLocation.lon);
    }
  }, [userLocation, radius]);

  // 📏 Distance
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // 📡 Fetch freelancers
  const fetchFreelancers = async (lat, lon) => {
    try {
      const res = await axios.get("/freelancers"); // ✅ FIXED

      console.log("API DATA:", res.data);

      const data = res.data?.data?.data || [];

      const available = data.filter(
        (f) => f.availability_status === "available",
      );

      const withDistance = available
        .map((f) => {
          if (f.latitude == null || f.longitude == null) return null;

          const distance = getDistance(
            lat,
            lon,
            parseFloat(f.latitude),
            parseFloat(f.longitude),
          );

          return { ...f, distance };
        })
        .filter(Boolean);

      const filtered = withDistance
        .filter((f) => f.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      setFreelancers(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🌍 City
  const fetchCity = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      );
      const data = await res.json();

      setCity(
        data.address.city ||
          data.address.town ||
          data.address.village ||
          "Your Area",
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="py-16 bg-white border-t">
      <div className="max-w-6xl mx-auto px-6">
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold">
            Freelancers Near {city || "You"}
          </h2>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm text-gray-500">Radius:</span>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="border rounded px-3 py-1"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
            </select>
          </div>
        </div>

        {/* STATES */}
        {loading && <p>Loading...</p>}
        {!loading && freelancers.length === 0 && <p>No freelancers found</p>}

        {/* LIST */}
        {/* <div className="grid md:grid-cols-3 gap-6">
          {freelancers.map((f) => (
            <div key={f.id} className="border p-4 rounded-lg">
              <h3 className="font-semibold">
                {f.first_name} {f.last_name}
              </h3>

              <p className="text-sm">{f.professional_title}</p>

              <p className="text-xs text-green-600">
                {f.distance.toFixed(1)} km away
              </p>

              <Link to={`/freelancer/${f.username}`}>View Profile →</Link>
            </div>
          ))}
        </div> */}

        {/* 🗺️ MAP (FIXED POSITION) */}
        <NearbyFreelancersMap
          userLocation={userLocation}
          freelancers={freelancers}
          radius={radius}
        />
      </div>
    </section>
  );
}
