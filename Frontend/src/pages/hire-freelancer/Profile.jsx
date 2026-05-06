import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../services/api";
import { useClientAuth } from "../../context/client/useClientAuth";
import LocationPicker from "../../components/profile/freelancer/LocationPicker";

export default function ClientProfile() {
  const { profile, refreshUser, logout } = useClientAuth();
  const { username } = useParams();

  const [formData, setFormData] = useState({
    company_name: "",
    company_website: "",
    industry: "",
    company_size: "",
    description: "",
    country: "",
    state: "",
    city: "",
    postcode: "",
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [locationTouched, setLocationTouched] = useState(false);

  const [previousPostcode, setPreviousPostcode] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ------------------ PREFILL PROFILE ------------------ */
  useEffect(() => {
    if (!profile) return;

    setFormData({
      company_name: profile.company_name || "",
      company_website: profile.company_website || "",
      industry: profile.industry || "",
      company_size: profile.company_size || "",
      description: profile.description || "",
      country: profile.country || "",
      state: profile.state || "",
      city: profile.city || "",
      postcode: profile.postcode || "",
      latitude: profile.latitude !== null ? Number(profile.latitude) : null,
      longitude: profile.longitude !== null ? Number(profile.longitude) : null,
    });

    setSelectedLat(profile.latitude !== null ? Number(profile.latitude) : null);
    setSelectedLng(
      profile.longitude !== null ? Number(profile.longitude) : null,
    );

    setPreviousPostcode(profile.postcode || "");
  }, [profile]);



  /* ------------------ VALIDATION ------------------ */
  const validateField = (name, value) => {
    const requiredFields = [
      "company_name",
      "industry",
      "company_size",
      "description",
      "country",
      "state",
      "city",
    ];
    if (requiredFields.includes(name) && (!value || String(value).trim() === "")) {
      return "This field is required";
    }
    if (name === "company_website" && value && !/^https?:\/\/.+/.test(value)) {
      return "Must be a valid URL starting with http:// or https://";
    }
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  /* ------------------ HANDLE INPUT CHANGE ------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /* ------------------ SAVE PROFILE ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setTouched(
        Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      toast.error("Please fill in all required fields correctly.");
      setLoading(false);
      return;
    }

    try {
      const postcodeChanged = formData.postcode !== previousPostcode;

      // 🔥 If postcode changed → force lat/lng null BEFORE saving
      const payload = {
        ...formData,
        latitude: postcodeChanged ? null : formData.latitude,
        longitude: postcodeChanged ? null : formData.longitude,
      };

      await axios.put(
        `/hire-freelancer/${username}/profile`,
        payload,
      );

      await refreshUser();

      toast.success("Profile saved successfully!");

      if (postcodeChanged) {
        toast.info(
          "Your postcode has been updated. Please confirm your location on the map.",
          { autoClose: 6000 },
        );

        // 🔥 Clear local state too
        setSelectedLat(null);
        setSelectedLng(null);
        setLocationTouched(false);
        setPreviousPostcode(formData.postcode);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const backendErrors = {};
        for (const [key, messages] of Object.entries(err.response.data.errors)) {
          backendErrors[key] = messages[0];
        }
        setFieldErrors(backendErrors);
        setTouched(
          Object.keys(backendErrors).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {},
          ),
        );
        toast.error("Validation failed. Please check the highlighted fields.");
      } else {
        toast.error(err.response?.data?.message || "Failed to save profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ DELETE ACCOUNT ------------------ */
  const handleDelete = async () => {
    try {
      setLoading(true);

      await axios.delete(`/hire-freelancer/${username}`);

      toast.success("Your account has been deleted.");
      logout();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account.");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  /* ------------------ MAP LOCATION SELECT ------------------ */
  const handleLocationSelect = (lat, lng, addressData) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setLocationTouched(true);

    // Keep formData synced so map centers correctly
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      ...(addressData
        ? {
            postcode: addressData.postcode || prev.postcode,
            country: addressData.country || prev.country,
            city: addressData.city || prev.city,
            state: addressData.state || prev.state,
          }
        : {}),
    }));

    if (addressData?.postcode) {
      setPreviousPostcode(addressData.postcode);
    }
  };

  /* ------------------ CONFIRM LOCATION SAVE ------------------ */
  const handleConfirmLocation = async () => {
    console.log("Selected location:", selectedLat, selectedLng);
    if (selectedLat === null || selectedLng === null) {
      toast.warn("Please select your location on the map first.");
      return;
    }

    try {
      setSavingLocation(true);

      await axios.put(`/hire-freelancer/${username}/profile`, {
        latitude: selectedLat,
        longitude: selectedLng,
        state: formData.state,
        city: formData.city,
        postcode: formData.postcode,
      });

      await refreshUser(); // 🔥 IMPORTANT

      setLocationTouched(false);
      toast.success("Location saved successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save location.");
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <main className="app-main">
      <section className="page">
        <div className="container">
          <header className="page-header">
            <h1 className="page-title">Company profile</h1>
            <p className="page-subtitle">
              Tell freelancers more about your company and where you&apos;re
              based so we can match you more accurately.
            </p>
          </header>

          <div className="dashboard-shell">
            <div className="dashboard-panel">

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label" htmlFor="company_name">
                      Company name
                    </label>
                    <input
                      id="company_name"
                      className={`form-input bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${touched.company_name && fieldErrors.company_name ? "form-input-error" : ""}`}
                      type="text"
                      name="company_name"
                      placeholder="Company name"
                      value={formData.company_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.company_name && fieldErrors.company_name && (
                      <p className="form-status form-status-error" style={{ marginTop: "0.25rem" }}>{fieldErrors.company_name}</p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="company_website">
                      Company website
                    </label>
                    <input
                      id="company_website"
                      className={`form-input ${touched.company_website && fieldErrors.company_website ? "form-input-error" : ""}`}
                      type="text"
                      name="company_website"
                      placeholder="https://"
                      value={formData.company_website}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.company_website && fieldErrors.company_website && (
                      <p className="form-status form-status-error" style={{ marginTop: "0.25rem" }}>{fieldErrors.company_website}</p>
                    )}
                  </div>



                  <div className="form-row-split">
                    <div className="form-field">
                      <label className="form-label" htmlFor="industry">
                        Industry
                      </label>
                      <input
                        id="industry"
                        className={`form-input bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${touched.industry && fieldErrors.industry ? "form-input-error" : ""}`}
                        type="text"
                        name="industry"
                        placeholder="e.g. Software, Construction"
                        value={formData.industry}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.industry && fieldErrors.industry && (
                        <p className="form-status form-status-error" style={{ marginTop: "0.25rem" }}>{fieldErrors.industry}</p>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="form-label" htmlFor="company_size">
                        Company size
                      </label>
                      <input
                        id="company_size"
                        className={`form-input bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${touched.company_size && fieldErrors.company_size ? "form-input-error" : ""}`}
                        type="text"
                        name="company_size"
                        placeholder="e.g. 10–50"
                        value={formData.company_size}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.company_size && fieldErrors.company_size && (
                        <p className="form-status form-status-error" style={{ marginTop: "0.25rem" }}>{fieldErrors.company_size}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="description">
                      Company description
                    </label>
                    <textarea
                      id="description"
                      className={`form-input ${touched.description && fieldErrors.description ? "form-input-error" : ""}`}
                      rows={3}
                      name="description"
                      placeholder="What does your company do?"
                      value={formData.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.description && fieldErrors.description && (
                      <p className="form-status form-status-error" style={{ marginTop: "0.25rem" }}>{fieldErrors.description}</p>
                    )}
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="country">
                      Country
                    </label>
                    <input
                      id="country"
                      className={`form-input bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${touched.country && fieldErrors.country ? "form-input-error" : ""}`}
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={formData.country}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.country && fieldErrors.country && (
                      <p className="form-status form-status-error" style={{ marginTop: "0.25rem" }}>{fieldErrors.country}</p>
                    )}
                  </div>

                  <div className="form-row-split">
                    <div className="form-field">
                      <label className="form-label" htmlFor="state">
                        State
                      </label>
                      <input
                        id="state"
                        className={`form-input ${touched.state && fieldErrors.state ? "form-input-error" : ""}`}
                        type="text"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.state && fieldErrors.state && (
                        <p className="form-status form-status-error" style={{ marginTop: "0.25rem" }}>{fieldErrors.state}</p>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="form-label" htmlFor="city">
                        City
                      </label>
                      <input
                        id="city"
                        className={`form-input bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${touched.city && fieldErrors.city ? "form-input-error" : ""}`}
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.city && fieldErrors.city && (
                        <p className="form-status form-status-error" style={{ marginTop: "0.25rem" }}>{fieldErrors.city}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="postcode">
                      Postcode
                    </label>
                    <input
                      id="postcode"
                      className={`form-input ${touched.postcode && fieldErrors.postcode ? "form-input-error" : ""}`}
                      type="text"
                      name="postcode"
                      placeholder="Postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.postcode && fieldErrors.postcode && (
                      <p className="form-status form-status-error" style={{ marginTop: "0.25rem" }}>{fieldErrors.postcode}</p>
                    )}
                    <p className="form-note">
                      Changing your postcode will require you to confirm a new
                      location on the map.
                    </p>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </form>
            </div>

            <aside className="dashboard-panel">
              <h2 className="dashboard-panel-title">Company location</h2>
              <p
                className="dashboard-panel-muted"
                style={{ marginBottom: "0.75rem" }}
              >
                Set the approximate location of your company so we can surface
                nearby freelancers first.
              </p>

              <div style={{ borderRadius: "0.75rem", overflow: "hidden" }}>
                <LocationPicker
                  postcode={
                    formData.latitude !== null && formData.longitude !== null
                      ? null
                      : formData.postcode
                  }
                  key={formData.postcode}
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  interactiveOnClick={true}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              {formData.postcode &&
                (formData.latitude === null || formData.longitude === null) && (
                  <p
                    className="form-status form-status-error"
                    style={{ marginTop: "0.5rem" }}
                  >
                    Please pick your company location on the map and click{" "}
                    <strong>Confirm location</strong>. This is required after
                    changing your postcode.
                  </p>
                )}

              <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <button
                  className="btn btn-outline"
                  onClick={handleConfirmLocation}
                  disabled={!locationTouched || savingLocation}
                >
                  {savingLocation ? "Saving..." : "Confirm location"}
                </button>
              </div>

              <hr style={{ margin: "1.25rem 0", borderColor: "#e5e7eb" }} />

              <h3 className="dashboard-panel-title">Danger zone</h3>
              <p className="dashboard-panel-muted">
                Deleting your account will permanently remove your projects and
                access.
              </p>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete account
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

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
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
