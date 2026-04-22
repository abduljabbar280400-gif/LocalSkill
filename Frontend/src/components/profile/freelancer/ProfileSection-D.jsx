import { useState, useEffect, useRef } from "react";
import api from "../../../services/api";
import Skills from "./Skills";
import LocationPicker from "./LocationPicker";

export default function ProfileSection({ profile, username, onUpdated }) {
  const [form, setForm] = useState({
    bio: profile.bio || "",
    hourly_rate: profile.hourly_rate || "",
    max_hours_per_week: profile.max_hours_per_week || "",
    city: profile.city || "",
    preferred_work_type: profile.preferred_work_type || "remote",
    profile_visibility: profile.profile_visibility || "hidden",
    postcode: profile.postcode || "",
    latitude: profile.latitude ?? null,
    longitude: profile.longitude ?? null,
  });

  const [selectedLat, setSelectedLat] = useState(form.latitude);
  const [selectedLng, setSelectedLng] = useState(form.longitude);
  const [locationTouched, setLocationTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const previousPostcodeRef = useRef(profile.postcode);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Save profile
  const handleSave = async () => {
    setIsSavingProfile(true);
    try {
      if (form.postcode !== previousPostcodeRef.current) {
        const {
          latitude: _latitude,
          longitude: _longitude,
          ...safePayload
        } = form;

        const res = await api.put(
          `/freelancer/${username}/profile`,
          safePayload,
        );

        onUpdated(res.data.profile);

        setForm((prev) => ({
          ...prev,
          latitude: null,
          longitude: null,
        }));
        setSelectedLat(null);
        setSelectedLng(null);
        setLocationTouched(false);
        previousPostcodeRef.current = form.postcode;

        alert(
          "Postal code changed. Please select your new location on the map.",
        );
        return;
      }

      const {
        latitude: _latitude2,
        longitude: _longitude2,
        ...safePayload2
      } = form;

      const res2 = await api.put(
        `/freelancer/${username}/profile`,
        safePayload2,
      );

      onUpdated(res2.data.profile);
    } catch (error) {
      console.error(error);
      alert("Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setLocationTouched(true);
  };

  const handleConfirmLocation = async () => {
    if (!selectedLat || !selectedLng) {
      alert("Please select your location on the map first.");
      return;
    }

    try {
      setSaving(true);
      const res = await api.put(`/freelancer/${username}/profile`, {
        latitude: selectedLat,
        longitude: selectedLng,
      });

      onUpdated(res.data.profile);

      setForm((prev) => ({
        ...prev,
        latitude: selectedLat,
        longitude: selectedLng,
      }));

      setLocationTouched(false);
      alert("Location saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setForm({
      bio: profile.bio || "",
      hourly_rate: profile.hourly_rate || "",
      max_hours_per_week: profile.max_hours_per_week || "",
      city: profile.city || "",
      preferred_work_type: profile.preferred_work_type || "remote",

      // ✅ CHANGED: keep backend value
      profile_visibility: profile.profile_visibility || "hidden",

      postcode: profile.postcode || "",
      latitude: profile.latitude ?? null,
      longitude: profile.longitude ?? null,
    });

    setSelectedLat(profile.latitude ?? null);
    setSelectedLng(profile.longitude ?? null);
  }, [profile]);

  return (
    <section>
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            className="form-input"
            rows={3}
            value={form.bio}
            onChange={handleChange}
            placeholder="Briefly describe your skills, experience and the type of work you enjoy."
          />
        </div>

        <div className="form-row-split">
          <div className="form-field">
            <label className="form-label" htmlFor="hourly_rate">
              Hourly rate
            </label>
            <input
              id="hourly_rate"
              name="hourly_rate"
              className="form-input"
              type="number"
              value={form.hourly_rate}
              onChange={handleChange}
              placeholder="e.g. 1000"
              min="0"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="max_hours_per_week">
              Max hours per week
            </label>
            <input
              id="max_hours_per_week"
              name="max_hours_per_week"
              className="form-input"
              type="number"
              value={form.max_hours_per_week}
              onChange={handleChange}
              placeholder="e.g. 20"
              min="1"
            />
          </div>
        </div>

        <div className="form-row-split">
          <div className="form-field">
            <label className="form-label" htmlFor="preferred_work_type">
              Preferred work type
            </label>
            <select
              id="preferred_work_type"
              name="preferred_work_type"
              className="form-select"
              value={form.preferred_work_type}
              onChange={handleChange}
            >
              <option value="remote">Remote</option>
              <option value="local">Local</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="profile_visibility">
              Profile visibility
            </label>
            <select
              id="profile_visibility"
              name="profile_visibility"
              className="form-select"
              value={form.profile_visibility}
              onChange={handleChange}
            >
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
            <p className="form-note">
              Set to <strong>hidden</strong> if you don&apos;t want clients to
              discover your profile for now.
            </p>
          </div>
        </div>

        <div className="form-row-split">
          <div className="form-field">
            <label className="form-label" htmlFor="city">
              City
            </label>
            <input
              id="city"
              name="city"
              className="form-input"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="postcode">
              Postcode
            </label>
            <input
              id="postcode"
              name="postcode"
              className="form-input"
              value={form.postcode}
              onChange={handleChange}
              placeholder="Postcode"
            />
            <p className="form-note">
              After changing your postcode, you&apos;ll need to confirm a new
              location on the map.
            </p>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="button" onClick={handleSave} disabled={isSavingProfile}>
          {isSavingProfile ? "Saving..." : "Save profile"}
        </button>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h3 className="dashboard-panel-title">Your location</h3>
        <p className="dashboard-panel-muted" style={{ marginBottom: "0.6rem" }}>
          Choose the location clients should see for local work.
        </p>

        <LocationPicker
          key={form.postcode}
          postcode={form.postcode}
          latitude={form.latitude}
          longitude={form.longitude}
          onLocationSelect={handleLocationSelect}
        />

        <button
          type="button"
          className="btn btn-outline"
          style={{ marginTop: "0.75rem" }}
          disabled={!locationTouched || saving}
          onClick={handleConfirmLocation}
        >
          {saving ? "Saving..." : "Confirm location"}
        </button>

        {form.postcode &&
          (form.latitude === null || form.longitude === null) && (
            <p
              className="form-status form-status-error"
              style={{ marginTop: "0.5rem" }}
            >
              Please pick your location on the map and click{" "}
              <strong>Confirm location</strong>. This is required after changing
              your postcode.
            </p>
          )}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h3 className="dashboard-panel-title">Skills</h3>
        <p className="dashboard-panel-muted" style={{ marginBottom: "0.6rem" }}>
          Add and manage the skills that best represent the work you do.
        </p>
        <Skills username={username} categoryId={profile.primary_category_id} />
      </div>
    </section>
  );
}
