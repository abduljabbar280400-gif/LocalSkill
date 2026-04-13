import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

import { useAuth } from "../../context/useAuth";

import Skills from "../../components/profile/freelancer/Skills";
import LocationPicker from "../../components/profile/freelancer/LocationPicker";

import Select from "react-select";

import { languages as languageOptions } from "../../constants/languages";
import {
  currencies,
  currencyOptions,
  formatHourlyRate,
} from "../../constants/currencies";

export default function EditProfilePage() {
  const { username } = useParams();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingLocation, setSavingLocation] = useState(false);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    professional_title: "",
    primary_category_id: "",
    experience_level: "beginner",
    bio: "",
    hourly_rate: "",
    city: "",
    postcode: "",
    latitude: null,
    longitude: null,
    preferred_work_type: "remote",
    profile_visibility: "hidden",

    // 🔥 REQUIRED
    currency: "INR",
    country: "",
    state: "",
    street_address: "",
    landmark: "",
    languages: [],
  });

  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [locationTouched, setLocationTouched] = useState(false);

  const [user, setUser] = useState(null);

  const [progress, setProgress] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState([]);

  const selectedCurrency = currencies[form?.currency];
  const currencySymbol = selectedCurrency?.symbol || "₹";

  const previousPostcodeRef = useRef(null);

  const formattedRate = form
    ? formatHourlyRate(form.currency, form.hourly_rate, currencies)
    : "";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, categoryRes] = await Promise.all([
          api.get(`/freelancer/${username}/my-profile`),
          api.get("/categories"),
        ]);

        const data = profileRes.data;

        const profileData = data.profile || {};
        const userData = data.user || null;

        setProfile(profileData);
        setUser(userData);
        setCategories(categoryRes.data.data);
        setProgress(profileRes.data.completion || 0);
        setCompletion(profileRes.data.completion || 0);
        setMissingFields(profileRes.data.missing_fields || []);

        setForm({
          professional_title: profileData.professional_title || "",
          primary_category_id: profileData.primary_category_id || "",
          experience_level: profileData.experience_level || "beginner",
          bio: profileData.bio || "",
          hourly_rate: profileData.hourly_rate || "",
          city: profileData.city || "",
          preferred_work_type: profileData.preferred_work_type || "remote",
          profile_visibility: profileData.profile_visibility || "hidden",
          postcode: profileData.postcode || "",
          latitude: profileData.latitude ?? null,
          longitude: profileData.longitude ?? null,

          // 🔥 FIXED
          currency: profileData.currency || "INR",
          country: profileData.country || "",
          state: profileData.state || "",
          street_address: profileData.street_address || "",
          landmark: profileData.landmark || "",
          languages: profileData.languages || [],
        });

        setSelectedLat(profileData.latitude ?? null);
        setSelectedLng(profileData.longitude ?? null);

        previousPostcodeRef.current = profileData.postcode;
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
      setProgress(res.data.completion);
      setMissingFields(res.data.missing_fields);
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-4 px-4">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Edit Your Profile
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Keep your profile updated to attract more clients and opportunities.
          </p>
        </div>

        {completion < 100 && (
          <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            {/* Progress */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">
                Profile Completion
              </p>
              <span className="text-sm font-semibold text-gray-900">
                {progress}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  progress === 100 ? "bg-green-500" : "bg-black"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Dynamic Message */}
            <div className="mt-4">
              {progress === 100 ? (
                <p className="text-sm text-green-600 font-medium">
                  🎉 Your profile is complete and visible to clients!
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    Complete your profile to make it visible to clients.
                  </p>

                  <ul className="space-y-1">
                    {missingFields.slice(0, 3).map((item, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {missingFields.length > 3 && (
                    <p className="text-xs text-gray-400 mt-1">
                      +{missingFields.length - 3} more fields to complete
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ACCOUNT INFO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Account Information
          </h2>
          <p className="text-gray-500 text-sm mb-2">
            Your personal account details are shown here for reference. These
            fields cannot be edited to maintain account security and identity
            consistency.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Title", value: user?.title },
              { label: "First Name", value: user?.first_name },
              { label: "Last Name", value: user?.last_name },
              { label: "Username", value: user?.username },
              { label: "Email", value: user?.email },
              { label: "Phone", value: user?.phone },
              { label: "Date of Birth", value: user?.dob },
            ].map((item, i) => (
              <div key={i}>
                <label className="text-xs text-gray-500">{item.label}</label>
                {/* <input
                      value={item.value || ""}
                      readOnly
                      className="w-full mt-1 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 border border-gray-200 cursor-not-allowed"
                    /> */}
                <p className="w-full mt-1 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-default">
                  {item.value || ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSave}
          className="bg-white p-6 mt-6 rounded-2xl shadow-sm border border-gray-200 space-y-8"
        >
          {/* BASIC INFO */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Basic Information
            </h2>
            <p className="text-gray-500 text-sm mb-2">
              Provide a clear and professional overview of who you are and what
              you offer. This helps clients quickly understand your expertise
              and services.
            </p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Professional Title
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  This will appear as your headline.
                </p>
                <input
                  type="text"
                  name="professional_title"
                  value={form.professional_title}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <label className="text-sm font-medium text-gray-700">
                Primary Category
              </label>
              <select
                name="primary_category_id"
                value={form.primary_category_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <label className="text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                name="experience_level"
                value={form.experience_level}
                onChange={handleChange}
                className="input"
              >
                <option value="student">Student</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <label className="text-sm font-medium text-gray-700">
                About You
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={5}
                className="input"
                placeholder="Write something about yourself..."
              />

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Languages
                </label>

                <Select
                  isMulti
                  options={languageOptions}
                  value={languageOptions.filter((opt) =>
                    form.languages.includes(opt.value),
                  )}
                  onChange={(selected) => {
                    setForm((prev) => ({
                      ...prev,
                      languages: selected
                        ? selected.map((item) => item.value)
                        : [],
                    }));
                  }}
                />
              </div>

              {/* ADDRESS */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Location & Address
                </label>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    name="street_address"
                    value={form.street_address}
                    onChange={handleChange}
                    placeholder="Street Address"
                    className="input"
                  />
                  <input
                    name="landmark"
                    value={form.landmark}
                    onChange={handleChange}
                    placeholder="Landmark (Optional)"
                    className="input"
                  />
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="input"
                  />
                  <input
                    name="postcode"
                    value={form.postcode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    className="input"
                  />
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="input"
                  />
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="input"
                  />
                </div>
              </div>

              {/* WORK DETAILS */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Work Details
                </h2>
                <p className="text-gray-500 text-sm mb-2">
                  Define your hourly rate and availability so clients can easily
                  understand your working preferences.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Hourly Rate
                    </label>

                    <div className="flex gap-4 mt-1">
                      <select
                        name="currency"
                        value={form.currency}
                        onChange={handleChange}
                        className="w-[170px] border border-gray-300 rounded-xl px-4 py-3 
                              focus:ring-2 focus:ring-black focus:outline-none transition"
                      >
                        {currencyOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1">
                        <span className="absolute left-4 top-3 text-gray-500">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          name="hourly_rate"
                          value={form.hourly_rate}
                          onChange={handleChange}
                          className="pl-12 w-[150px] border border-gray-300 rounded-xl px-4 py-3 
                                focus:ring-2 focus:ring-black focus:outline-none transition"
                          placeholder="Enter rate"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      {formattedRate}
                    </p>
                  </div>
                </div>
              </div>
              {/* PREFERENCES */}
              <div className="grid md:grid-cols-2 gap-4">
                <select
                  name="preferred_work_type"
                  value={form.preferred_work_type}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="remote">Remote</option>
                  <option value="local">Local</option>
                  <option value="both">Both</option>
                </select>

                <select
                  name="profile_visibility"
                  value={form.profile_visibility}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="visible">Public</option>
                  <option value="hidden">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* SAVE */}
          <button className="w-full btn btn-primary px-6 py-3 rounded-xl hover:bg-gray-800 transition font-semibold">
            Save Changes
          </button>
        </form>

        {/* SKILLS */}
        <div className="bg-white p-6 mt-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Skills</h2>
          <p className="text-gray-500 text-sm mb-2">
            Showcase your strengths by adding relevant skills. Clients often
            search based on skills, so keep them accurate and up to date.
          </p>
          <Skills
            username={username}
            categoryId={profile.primary_category_id}
          />
        </div>

        {/* SIDE PANEL */}

        <div className="bg-white p-6 mt-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">Location</h2>
          <p className="text-gray-500 text-sm mb-2">
            Set your location to improve visibility in local searches and help
            clients find you for nearby opportunities.
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
            className="w-full bg-black text-white mt-4 py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
          >
            {savingLocation ? "Saving..." : "Confirm location"}
          </button>

          <hr className="my-6" />

          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition"
          >
            Delete account
          </button>
        </div>
      </div>
    </main>
  );
}
