import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

import { useAuth } from "../../context/useAuth";

import Skills from "../../components/profile/freelancer/Skills";
import LocationPicker from "../../components/profile/freelancer/LocationPicker";

export default function EditProfilePage() {
  const { username } = useParams();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingLocation, setSavingLocation] = useState(false);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);

  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [locationTouched, setLocationTouched] = useState(false);

  const previousPostcodeRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, categoryRes] = await Promise.all([
          api.get(`/freelancer/${username}/my-profile`),
          api.get("/categories"),
        ]);

        const data = profileRes.data.profile;

        setProfile(data);
        setCategories(categoryRes.data.data);

        setForm({
          professional_title: data.professional_title || "",
          primary_category_id: data.primary_category_id || "",
          experience_level: data.experience_level || "beginner",
          bio: data.bio || "",
          hourly_rate: data.hourly_rate || "",
          max_hours_per_week: data.max_hours_per_week || "",
          city: data.city || "",
          preferred_work_type: data.preferred_work_type || "remote",
          profile_visibility: data.profile_visibility || "hidden",
          postcode: data.postcode || "",
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        });

        setSelectedLat(data.latitude ?? null);
        setSelectedLng(data.longitude ?? null);

        previousPostcodeRef.current = data.postcode;
      } catch (err) {
        console.error(err);
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <p className="text-gray-600 text-lg animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat, lng) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setLocationTouched(true);
  };

  const handleConfirmLocation = async () => {
    if (!selectedLat || !selectedLng) {
      alert("Please select location first.");
      return;
    }

    try {
      setSavingLocation(true);

      const res = await api.put(`/freelancer/${username}/edit-profile`, {
        latitude: selectedLat,
        longitude: selectedLng,
      });

      setProfile(res.data.profile);
      setLocationTouched(false);
      alert("Location saved successfully.");
    } catch (err) {
      console.log(err);
      alert("Failed to save location.");
    } finally {
      setSavingLocation(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const res = await api.put(`/freelancer/${username}/edit-profile`, form);
      setProfile(res.data.profile);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action can be restored later but you will be logged out.",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/freelancer/${username}`);

      alert("Account deleted successfully. You will be logged out.");

      await logout();
      window.location.href = "/freelancer/login";
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to delete account. Please try again.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Edit Your Profile
          </h1>
          <p className="text-gray-500 mt-2">
            Keep your profile updated to attract more clients and opportunities.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* MAIN FORM */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur p-8 rounded-3xl shadow-lg border border-gray-100">
            <form onSubmit={handleSave} className="space-y-8">
              {/* SECTION */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Basic Information
                </h2>

                {/* Professional Title */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Professional Title
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    This will appear as your headline.
                  </p>
                  <input
                    type="text"
                    name="professional_title"
                    value={form.professional_title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none transition"
                  />
                </div>

                {/* Category */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Primary Category
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Choose your main expertise.
                  </p>
                  <select
                    name="primary_category_id"
                    value={form.primary_category_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    name="experience_level"
                    value={form.experience_level}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* BIO */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  About You
                </h2>
                <p className="text-xs text-gray-500 mb-2">
                  Describe your skills, experience and strengths.
                </p>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write something about yourself..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>

              {/* DETAILS */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Work Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Hourly Rate (₹)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Set how much you charge per hour.
                    </p>
                    <input
                      type="number"
                      name="hourly_rate"
                      value={form.hourly_rate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>

                  {/* Max Hours */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Max Hours / Week
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Your weekly availability.
                    </p>
                    <input
                      type="number"
                      name="max_hours_per_week"
                      value={form.max_hours_per_week}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* LOCATION TEXT */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  City
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Your current working location.
                </p>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Pincode / Postcode
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Used to detect your location on map.
                </p>
                <input
                  type="text"
                  name="postcode"
                  value={form.postcode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>

              {/* PREFERENCES */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Work Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Preferred Work Type
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Choose how you want to work.
                  </p>
                  <select
                    name="preferred_work_type"
                    value={form.preferred_work_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                  >
                    <option value="remote">Remote</option>
                    <option value="local">Local</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Profile Visibility
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Control who can see your profile.
                  </p>
                  <select
                    name="profile_visibility"
                    value={form.profile_visibility}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                  >
                    <option value="visible">Public</option>
                    <option value="hidden">Private</option>
                  </select>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition font-semibold">
                Save Changes
              </button>

              {/* SKILLS BELOW BUTTON */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h2 className="text-lg font-semibold mb-3">Skills</h2>

                <Skills
                  username={username}
                  categoryId={profile.primary_category_id}
                />
              </div>
            </form>
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-lg border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Location
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Set your exact location for better visibility.
              </p>

              <div className="rounded-xl overflow-hidden">
                <LocationPicker
                  key={form.postcode}
                  postcode={form.postcode}
                  latitude={form.latitude}
                  longitude={form.longitude}
                  interactiveOnClick={true}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              <button
                onClick={handleConfirmLocation}
                disabled={!locationTouched || savingLocation}
                className="w-full bg-black text-white my-5 py-3 rounded-xl hover:bg-gray-800 transition font-semibold disabled:opacity-50"
              >
                {savingLocation ? "Saving..." : "Confirm location"}
              </button>

              <hr className="my-6" />

              <h3 className="text-md font-semibold text-red-600 mb-1">
                Danger zone
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                This action cannot be undone.
              </p>

              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
