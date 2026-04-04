import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    state: "",
    city: "",
    postcode: "",
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [locationTouched, setLocationTouched] = useState(false);

  const [previousPostcode, setPreviousPostcode] = useState(null);

  /* ------------------ PREFILL PROFILE ------------------ */
  useEffect(() => {
    if (!profile) return;

    setFormData({
      company_name: profile.company_name || "",
      company_website: profile.company_website || "",
      industry: profile.industry || "",
      company_size: profile.company_size || "",
      description: profile.description || "",
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

  /* ------------------ AUTO CLEAR SUCCESS ------------------ */
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  /* ------------------ HANDLE INPUT CHANGE ------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ------------------ SAVE PROFILE ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     Accept: "application/json",
        //   },
        // },
      );

      await refreshUser();

      setSuccess("Profile saved successfully!");

      if (postcodeChanged) {
        alert(
          'Your postcode has been updated. Please choose your company location on the map and click "Confirm location". This step is required after changing postcode.',
        );

        // 🔥 Clear local state too
        setSelectedLat(null);
        setSelectedLng(null);
        setLocationTouched(false);
        setPreviousPostcode(formData.postcode);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ DELETE ACCOUNT ------------------ */
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await axios.delete(
        `/hire-freelancer/${username}`,
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     Accept: "application/json",
        //   },
        // },
      );

      alert("Your account has been deleted.");
      logout();
    } catch (err) {
      console.error(err);
      setError("Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ MAP LOCATION SELECT ------------------ */
  const handleLocationSelect = (lat, lng) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setLocationTouched(true);

    // Keep formData synced so map centers correctly
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  /* ------------------ CONFIRM LOCATION SAVE ------------------ */
  const handleConfirmLocation = async () => {
    console.log("Selected location:", selectedLat, selectedLng);
    if (selectedLat === null || selectedLng === null) {
      alert("Please select your location on the map first.");
      return;
    }

    try {
      setSavingLocation(true);

      await axios.put(
        `/hire-freelancer/${username}/profile`,
        {
          latitude: selectedLat,
          longitude: selectedLng,
        },
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     Accept: "application/json",
        //   },
        // },
      );

      await refreshUser(); // 🔥 IMPORTANT

      setLocationTouched(false);
      alert("Location saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to save location.");
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
              {(loading || savingLocation) && (
                <div
                  className="loading-page"
                  style={{ minHeight: "auto", marginBottom: "0.75rem" }}
                >
                  <div className="loading-spinner" />
                  <p className="loading-text">
                    {savingLocation
                      ? "Saving location..."
                      : "Saving profile..."}
                  </p>
                </div>
              )}
              {error && <div className="form-error-banner">{error}</div>}
              {success && (
                <div
                  className="form-error-banner"
                  style={{
                    borderColor: "#bbf7d0",
                    background: "#dcfce7",
                    color: "#166534",
                  }}
                >
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label" htmlFor="company_name">
                      Company name
                    </label>
                    <input
                      id="company_name"
                      className="form-input"
                      type="text"
                      name="company_name"
                      placeholder="Company name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="company_website">
                      Company website
                    </label>
                    <input
                      id="company_website"
                      className="form-input"
                      type="text"
                      name="company_website"
                      placeholder="https://"
                      value={formData.company_website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-row-split">
                    <div className="form-field">
                      <label className="form-label" htmlFor="industry">
                        Industry
                      </label>
                      <input
                        id="industry"
                        className="form-input"
                        type="text"
                        name="industry"
                        placeholder="e.g. Software, Construction"
                        value={formData.industry}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label" htmlFor="company_size">
                        Company size
                      </label>
                      <input
                        id="company_size"
                        className="form-input"
                        type="text"
                        name="company_size"
                        placeholder="e.g. 10–50"
                        value={formData.company_size}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="description">
                      Company description
                    </label>
                    <textarea
                      id="description"
                      className="form-input"
                      rows={3}
                      name="description"
                      placeholder="What does your company do?"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row-split">
                    <div className="form-field">
                      <label className="form-label" htmlFor="state">
                        State
                      </label>
                      <input
                        id="state"
                        className="form-input"
                        type="text"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label" htmlFor="city">
                        City
                      </label>
                      <input
                        id="city"
                        className="form-input"
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="postcode">
                      Postcode
                    </label>
                    <input
                      id="postcode"
                      className="form-input"
                      type="text"
                      name="postcode"
                      placeholder="Postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                    />
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

              <button
                className="btn btn-outline"
                style={{ marginTop: "0.75rem" }}
                onClick={handleConfirmLocation}
                disabled={!locationTouched || savingLocation}
              >
                {savingLocation ? "Saving..." : "Confirm location"}
              </button>

              <hr style={{ margin: "1.25rem 0", borderColor: "#e5e7eb" }} />

              <h3 className="dashboard-panel-title">Danger zone</h3>
              <p className="dashboard-panel-muted">
                Deleting your account will permanently remove your projects and
                access.
              </p>

              <button
                type="button"
                className="btn btn-danger"
                style={{ marginTop: "0.7rem" }}
                onClick={handleDelete}
              >
                Delete account
              </button>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
