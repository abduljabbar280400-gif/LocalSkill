import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../../services/api";
import LocationPicker from "../../components/profile/freelancer/LocationPicker";

import { useClientAuth } from "../../context/client/useClientAuth";

export default function ProjectModal({
  showModal,
  setShowModal,
  editingProject,
  formData,
  setFormData,
  categories,
  skillsList,
  setSkillsList,
  skillsLoading,
  setSkillsLoading,
  handleCreate,
  handleUpdate,
  errors,
}) {
  // const [locationType, setLocationType] = useState(
  //   formData.location_type || "profile",
  // );
  const [profileLocation, setProfileLocation] = useState(null);

  const { user } = useClientAuth();

  console.log("USERNAME:", user.username);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  useEffect(() => {
    async function fetchProfileLocation() {
      try {
        if (!user?.username) return;

        console.log("👤 USER:", user.username);

        const res = await api.get(`/hire-freelancer/${user.username}/profile`);

        console.log("✅ PROFILE RESPONSE:", res.data);

        const profile = res.data?.profile;

        if (!profile) {
          console.error("❌ Profile is null");
          return;
        }

        setProfileLocation(profile);

        // ✅ SET VALUES IMMEDIATELY
        if (!editingProject) {
          setFormData((prev) => ({
            ...prev,
            latitude: profile.latitude,
            longitude: profile.longitude,
            postal_code: profile.postcode,
            location_type: "profile",
          }));
        }
      } catch (err) {
        console.error("❌ PROFILE ERROR:", err.response?.data || err);
      }
    }

    fetchProfileLocation();
  }, [user?.username, editingProject]);

  // useEffect(() => {
  //   if (locationType === "profile" && profileLocation) {
  //     setLatitude(profileLocation.latitude);
  //     setLongitude(profileLocation.longitude);
  //     setPostalCode(profileLocation.postcode);

  //     setFormData((prev) => ({
  //       ...prev,
  //       latitude: profileLocation.latitude,
  //       longitude: profileLocation.longitude,
  //       postal_code: profileLocation.postcode,
  //     }));
  //   }
  // }, [locationType, profileLocation]);

  if (!showModal) return null;

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {editingProject ? "Edit Project" : "Create Project"}
          </h3>
        </div>

        <div className="modal-body">
          {/* ================= TITLE ================= */}
          <div className="form-field">
            <label className="form-label" htmlFor="title">
              Title
            </label>

            <input
              id="title"
              className="form-input"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            {errors?.title && (
              <p className="form-status form-status-error">{errors.title[0]}</p>
            )}
          </div>

          {/* ================= DESCRIPTION ================= */}
          <div className="form-field">
            <label className="form-label" htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              className="form-input"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              required
            />

            {errors?.description && (
              <p className="form-status form-status-error">
                {errors.description[0]}
              </p>
            )}
          </div>

          {/* ================= CATEGORY ================= */}
          <div className="form-field">
            <label className="form-label">Category</label>

            <Select
              options={categoryOptions}
              value={categoryOptions.find(
                (option) => option.value === formData.category_id,
              )}
              onChange={async (selectedOption) => {
                const categoryId = selectedOption?.value || "";

                setFormData({
                  ...formData,
                  category_id: categoryId,
                  skills: [],
                });

                if (!categoryId) {
                  setSkillsList([]);
                  return;
                }

                try {
                  setSkillsLoading(true);

                  const res = await api.get(`/categories/${categoryId}/skills`);

                  setSkillsList(res.data);
                } catch (error) {
                  console.error("Skill fetch error:", error);
                } finally {
                  setSkillsLoading(false);
                }
              }}
              placeholder="Search & select category"
            />

            {errors?.category_id && (
              <p className="form-status form-status-error">
                {errors.category_id[0]}
              </p>
            )}
          </div>

          {/* ================= SKILLS ================= */}
          <div className="form-field">
            <label className="form-label">Skills</label>

            {!formData.category_id && (
              <p className="form-status form-status-neutral">
                Please select a category first.
              </p>
            )}

            {skillsLoading && (
              <p className="form-status form-status-neutral"> Loading... </p>
            )}

            {formData.category_id &&
              !skillsLoading &&
              skillsList.length === 0 && (
                <p className="form-status form-status-error">
                  No skills found for this category.
                </p>
              )}

            {formData.category_id &&
              !skillsLoading &&
              skillsList.length > 0 && (
                <div
                  className="skills-scrollbox"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {skillsList.map((skill) => (
                    <label key={skill.id} className="skills-checkbox">
                      <input
                        className="skills-checkbox-input"
                        type="checkbox"
                        value={skill.id}
                        checked={formData.skills.includes(skill.id)}
                        onChange={(e) => {
                          const skillId = skill.id;

                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              skills: [...formData.skills, skillId],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              skills: formData.skills.filter(
                                (id) => id !== skillId,
                              ),
                            });
                          }
                        }}
                      />
                      {skill.name}
                    </label>
                  ))}
                </div>
              )}

            {errors?.skills && (
              <p className="form-status form-status-error">
                {errors.skills[0]}
              </p>
            )}
          </div>

          {/* ================= BUDGET ================= */}
          <div className="form-row-split">
            <div className="form-field">
              <label className="form-label" htmlFor="budget_min">
                Budget min
              </label>

              <input
                id="budget_min"
                className="form-input"
                type="number"
                placeholder="e.g. 1000"
                value={formData.budget_min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget_min: e.target.value,
                  })
                }
                required
              />

              {errors?.budget_min && (
                <p className="form-status form-status-error">
                  {errors.budget_min[0]}
                </p>
              )}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="budget_max">
                Budget max
              </label>

              <input
                id="budget_max"
                className="form-input"
                type="number"
                placeholder="e.g. 5000"
                value={formData.budget_max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget_max: e.target.value,
                  })
                }
                required
              />

              {errors?.budget_max && (
                <p className="form-status form-status-error">
                  {errors.budget_max[0]}
                </p>
              )}
            </div>
          </div>

          {/* ================= BUDGET TYPE ================= */}
          <div className="form-field">
            <label className="form-label" htmlFor="budget_type">
              Budget type
            </label>

            <select
              id="budget_type"
              className="form-select"
              value={formData.budget_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budget_type: e.target.value,
                })
              }
              required
            >
              <option value="">Select budget type</option>
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            {errors?.budget_type && (
              <p className="form-status form-status-error">
                {errors.budget_type[0]}
              </p>
            )}
          </div>

          {/* ================= EXPERIENCE ================= */}
          <div className="form-field">
            <label className="form-label" htmlFor="experience_level">
              Experience level
            </label>

            <select
              id="experience_level"
              className="form-select"
              value={formData.experience_level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  experience_level: e.target.value,
                })
              }
              required
            >
              <option value="">Select experience</option>
              <option value="student">Student</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {errors?.experience_level && (
              <p className="form-status form-status-error">
                {errors.experience_level[0]}
              </p>
            )}
          </div>

          {/* ================= PREFERRED WORK TYPE ================= */}
          <div className="form-field">
            <label className="form-label" htmlFor="preferred_work_type">
              Preferred Work Type
            </label>

            <select
              id="preferred_work_type"
              className="form-select"
              value={formData.preferred_work_type || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferred_work_type: e.target.value,
                })
              }
              required
            >
              <option value="">Select work type</option>
              <option value="remote">Remote</option>
              <option value="local">Local</option>
              <option value="both">Both</option>
            </select>

            {errors?.preferred_work_type && (
              <p className="form-status form-status-error">
                {errors.preferred_work_type[0]}
              </p>
            )}
          </div>

          {/* ================= DURATION ================= */}
          <div className="form-field">
            <label className="form-label" htmlFor="duration">
              Duration
            </label>

            <input
              id="duration"
              className="form-input"
              type="text"
              placeholder="e.g. 2 months"
              value={formData.duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: e.target.value,
                })
              }
              required
            />

            {errors?.duration && (
              <p className="form-status form-status-error">
                {errors.duration[0]}
              </p>
            )}
          </div>

          {/* ================= LOCATION ================= */}
          <div className="form-field">
            <label className="form-label">Project Location</label>

            <select
              className="form-select"
              value={formData.location_type || "profile"}
              onChange={(e) => {
                const type = e.target.value;

                if (type === "profile" && profileLocation) {
                  setFormData((prev) => ({
                    ...prev,
                    location_type: "profile",
                    latitude: profileLocation.latitude,
                    longitude: profileLocation.longitude,
                    postal_code: profileLocation.postcode,
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    location_type: "custom",
                  }));
                }
              }}
            >
              <option value="profile">Use Profile Location</option>
              <option value="custom">Add New Location For This Project</option>
            </select>
          </div>

          {/* PROFILE LOCATION */}
          {formData.location_type === "profile" &&
            profileLocation?.postcode && (
              <div className="form-field">
                <p className="form-status form-status-neutral">
                  Using your profile location
                </p>

                <LocationPicker
                  key={profileLocation.postcode}
                  postcode={formData.postal_code}
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  interactiveOnClick={true}
                  onLocationSelect={(lat, lng) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      postal_code: profileLocation.postcode,
                    }));
                  }}
                />
              </div>
            )}

          {/* CUSTOM LOCATION */}
          {formData.location_type === "custom" && (
            <div className="form-field">
              <label className="form-label">Postal Code</label>

              <input
                type="text"
                className="form-input"
                placeholder="Enter postal code"
                value={formData.postal_code || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    postal_code: e.target.value,
                  }))
                }
              />

              {formData.postal_code && (
                <LocationPicker
                  postcode={formData.postal_code}
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationSelect={(lat, lng) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      postal_code: formData.postal_code,
                    }));
                  }}
                />
              )}
            </div>
          )}

          {/* ================= DEADLINE ================= */}
          <div className="form-field">
            <label className="form-label" htmlFor="deadline">
              Deadline
            </label>

            <input
              id="deadline"
              className="form-input"
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deadline: e.target.value,
                })
              }
              required
            />

            {errors?.deadline && (
              <p className="form-status form-status-error">
                {errors.deadline[0]}
              </p>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (!formData.latitude || !formData.longitude) {
                alert("Please select a location on map");
                return;
              }

              const updatedData = {
                ...formData,
                location_type:
                  formData.location_type === "profile" ? "profile" : "custom",
              };
              console.log("🚀 FINAL SUBMIT DATA:", formData);
              // if (!latitude || !longitude) {
              //   alert("Please select a location on map");
              //   return;
              // }
              editingProject
                ? handleUpdate(updatedData)
                : handleCreate(updatedData);
            }}
          >
            {editingProject ? "Update Project" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
