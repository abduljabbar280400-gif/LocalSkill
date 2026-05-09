import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

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
import { useTheme } from "../../context/useTheme";

export default function EditProfilePage() {
  const { username } = useParams();
  const { logout } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingLocation, setSavingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950">
        <div className="flex justify-center py-4"><div className="common-spinner"></div></div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat, lng, addressData) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setLocationTouched(true);

    if (addressData) {
      setForm((prev) => ({
        ...prev,
        city: addressData.city || prev.city,
        postcode: addressData.postcode || prev.postcode,
        state: addressData.state || prev.state,
        latitude: lat,
        longitude: lng,
      }));
    }
  };

  const handleConfirmLocation = async () => {
    if (!selectedLat || !selectedLng) {
      toast.warn("Please select location on the map first.");
      return;
    }

    try {
      setSavingLocation(true);

      const res = await api.put(`/freelancer/${username}/edit-profile`, {
        latitude: selectedLat,
        longitude: selectedLng,
        city: form.city,
        postcode: form.postcode,
        state: form.state,
      });

      setProfile(res.data.profile);
      setLocationTouched(false);
      toast.success("Location saved successfully.");
    } catch (err) {
      console.log(err);
      toast.error("Failed to save location.");
    } finally {
      setSavingLocation(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await api.put(`/freelancer/${username}/edit-profile`, form);
      setProfile(res.data.profile);
      setProgress(res.data.completion);
      setMissingFields(res.data.missing_fields);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      await api.delete(`/freelancer/${username}`);

      toast.success("Account deleted successfully.");

      await logout();
      window.location.href = "/freelancer/login";
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to delete account.",
      );
      setIsDeleting(false);
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Custom styles for react-select in dark mode
  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: isDark ? "#1e293b" : "white",
      borderColor: isDark ? "#475569" : "#d1d5db",
      borderRadius: "12px",
      padding: "5px",
      boxShadow: "none",
      "&:hover": {
        borderColor: isDark ? "#64748b" : "#9ca3af",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#1e293b" : "white",
      borderRadius: "12px",
      overflow: "hidden",
      zIndex: 50,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? "#3b82f6"
        : isFocused
        ? isDark
          ? "#334155"
          : "#f3f4f6"
        : "transparent",
      color: isSelected ? "white" : isDark ? "#f8fafc" : "#111827",
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? "#334155" : "#e5e7eb",
      borderRadius: "6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? "#f8fafc" : "#111827",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? "#94a3b8" : "#6b7280",
      "&:hover": {
        backgroundColor: isDark ? "#475569" : "#d1d5db",
        color: isDark ? "white" : "black",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#f8fafc" : "#111827",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#64748b" : "#9ca3af",
    }),
    input: (base) => ({
      ...base,
      color: isDark ? "#f8fafc" : "#111827",
    }),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-4 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            Edit Your Profile
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">
            Keep your profile updated to attract more clients and opportunities.
          </p>
        </div>

        {completion < 100 && (
          <div className="mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            {/* Progress */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Profile Completion
              </p>
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                {progress}%
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  progress === 100 ? "bg-green-500" : "bg-black dark:bg-blue-600"
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
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                    Complete your profile to make it visible to clients.
                  </p>

                  <ul className="space-y-1">
                    {missingFields.slice(0, 3).map((item, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-500 rounded-full"></span>
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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">
            Account Information
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">
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
                <label className="text-xs text-gray-500 dark:text-slate-400">{item.label}</label>
                <p className="w-full mt-1 rounded-lg px-3 py-2 bg-gray-100 dark:bg-slate-900/50 text-gray-600 dark:text-slate-400 cursor-default border border-transparent dark:border-slate-700/50">
                  {item.value || ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-800 p-6 mt-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 space-y-8"
        >
          {/* BASIC INFO */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">
              Basic Information
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">
              Provide a clear and professional overview of who you are and what
              you offer. This helps clients quickly understand your expertise
              and services.
            </p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
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

              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
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

              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
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

              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
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
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
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
                  styles={selectStyles}
                />
              </div>

              {/* ADDRESS */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Location & Address
                </label>

                <div className="grid md:grid-cols-2 gap-4 mt-2">
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
                <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">
                  Work Details
                </h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">
                  Define your hourly rate and availability so clients can easily
                  understand your working preferences.
                </p>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
                    Hourly Rate
                  </label>
                  
                  <div className="max-w-md">
                    <div className="flex gap-0 overflow-hidden rounded-xl border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all shadow-sm">
                      {/* Currency Selector */}
                      <select
                        name="currency"
                        value={form.currency}
                        onChange={handleChange}
                        className="w-[220px] bg-gray-50 dark:bg-slate-900 border-r border-gray-300 dark:border-slate-600 px-3 py-3 text-gray-700 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
                      >
                        {currencyOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {/* Rate Input */}
                      <div className="relative flex-1 bg-white dark:bg-slate-800">
                        <span className="absolute left-4 top-3.5 text-gray-400 dark:text-slate-500 font-medium">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          name="hourly_rate"
                          value={form.hourly_rate}
                          onChange={handleChange}
                          className="pl-15 w-full bg-transparent py-3 text-gray-900 dark:text-slate-100 focus:outline-none font-semibold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        Estimated client cost:
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {formattedRate}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
              {/* PREFERENCES */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Preferred Work Type</label>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block">Profile Visibility</label>
                  <select
                    name="profile_visibility"
                    value={form.profile_visibility}
                    onChange={handleChange}
                    disabled={user?.is_suspended}
                    className={`input ${user?.is_suspended ? "bg-gray-50 dark:bg-slate-800/50 cursor-not-allowed opacity-75" : ""}`}
                  >
                    <option value="visible">Public</option>
                    <option value="hidden">Private</option>
                  </select>
                  {user?.is_suspended && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      Visibility Locked by Administration
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SAVE */}
          <div className="flex justify-center md:justify-end">
            <button 
              disabled={isSaving} 
              className="w-full mx-auto md:w-fit btn btn-primary px-10 py-4 rounded-xl transition font-bold text-lg disabled:opacity-50 shadow-xl shadow-blue-600/20"
            >
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>


        {/* SKILLS */}
        <div className="bg-white dark:bg-slate-800 p-6 mt-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3">Skills</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">
            Showcase your strengths by adding relevant skills. Clients often
            search based on skills, so keep them accurate and up to date.
          </p>
          <Skills
            username={username}
            categoryId={profile.primary_category_id}
          />
        </div>

        {/* SIDE PANEL */}

        <div className="bg-white dark:bg-slate-800 p-6 mt-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 mb-10">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Location</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">
            Set your location to improve visibility in local searches and help
            clients find you for nearby opportunities.
          </p>

          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
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
            className="w-full bg-black dark:bg-blue-600 text-white mt-4 py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
          >
            {savingLocation ? "Saving..." : "Confirm location"}
          </button>

          <hr className="my-8 border-gray-200 dark:border-slate-700" />

          <button
            type="button"
            className="px-6 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
            onClick={() => setShowDeleteModal(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </button>
        </div>
      </div>

      {/* ──────────────── DELETE CONFIRMATION MODAL ──────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Delete Account?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  This action is permanent and cannot be undone. All your data
                  will be removed.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
