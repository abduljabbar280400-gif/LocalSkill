import { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";

export default function Skills({ username }) {
  const [categories, setCategories] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH DATA ---------------- */

  const fetchCategories = useCallback(async () => {
    const res = await api.get("/categories");
    setCategories(res.data.data ?? res.data);
  }, []);

  const fetchAllSkills = useCallback(async () => {
    const res = await api.get("/skills");
    setAllSkills(res.data.data ?? res.data);
  }, []);

  const fetchMySkills = useCallback(async () => {
    const res = await api.get(`/freelancer/${username}/skills`);
    setMySkills(res.data.data);
  }, [username]);

  useEffect(() => {
    if (!username) return;

    (async () => {
      try {
        await Promise.all([
          fetchCategories(),
          fetchAllSkills(),
          fetchMySkills(),
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [username, fetchCategories, fetchAllSkills, fetchMySkills]);

  /* ---------------- FILTER SKILLS BY CATEGORY ---------------- */

  const filteredSkills = selectedCategoryId
    ? allSkills.filter(
        (skill) => String(skill.category_id) === String(selectedCategoryId),
      )
    : [];

  /* ---------------- ADD SKILL ---------------- */

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;

    await api.post(`/freelancer/${username}/skills`, {
      skill_id: selectedSkillId,
      experience_years: experienceYears || 0,
      is_primary: isPrimary,
    });

    // Reset
    setSelectedSkillId("");
    setExperienceYears("");
    setIsPrimary(false);

    fetchMySkills();
  };

  /* ---------------- REMOVE SKILL ---------------- */

  const handleDeleteSkill = async (skillId) => {
    await api.delete(`/freelancer/${username}/skills/${skillId}`);
    fetchMySkills();
  };

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: "120px" }}>
        <div className="loading-spinner" />
        <p className="loading-text">Loading your skills...</p>
      </div>
    );
  }

  return (
    <div>
      {/* ADD SKILL */}
      <div className="form-grid" style={{ marginBottom: "1rem" }}>
        <div className="form-row-split">
          <div className="form-field">
            <label className="form-label" htmlFor="skill-category">
              Category
            </label>
            <select
              id="skill-category"
              className="form-select"
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setSelectedSkillId("");
              }}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="skill-select">
              Skill
            </label>
            <select
              id="skill-select"
              className="form-select"
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              disabled={!selectedCategoryId}
            >
              <option value="">Select skill</option>
              {filteredSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row-split">
          <div className="form-field">
            <label className="form-label" htmlFor="experience_years">
              Experience (years)
            </label>
            <input
              id="experience_years"
              type="number"
              className="form-input"
              placeholder="e.g. 2"
              value={experienceYears}
              min="0"
              onChange={(e) => setExperienceYears(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Primary skill</label>
            <label className="form-helper" style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
              Mark this skill as primary
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddSkill}
          disabled={!selectedSkillId}
        >
          Add skill
        </button>
      </div>

      {/* MY SKILLS */}
      {mySkills.length === 0 ? (
        <p className="dashboard-panel-muted" style={{ marginTop: "0.75rem" }}>
          No skills added yet.
        </p>
      ) : (
        <div style={{ marginTop: "0.9rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.8fr) minmax(auto, 0.8fr)",
              columnGap: "1.5rem",
              rowGap: "0.4rem",
              fontSize: "0.85rem",
              marginBottom: "0.3rem",
            }}
          >
            <span className="form-label">Skills</span>
            <span className="form-label">Action</span>
          </div>

          {mySkills.map((item) => (
            <div
              key={item.skill_id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.8fr) minmax(auto, 0.8fr)",
                columnGap: "1.5rem",
                alignItems: "center",
                padding: "0.4rem 0.55rem",
                borderRadius: "0.6rem",
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                marginBottom: "0.4rem",
              }}
            >
              <span>
                <strong>{item.skill?.name}</strong> — {item.experience_years} yrs
                {item.is_primary && " (Primary)"}
              </span>
              <div>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ paddingInline: "0.75rem" }}
                  onClick={() => handleDeleteSkill(item.skill_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
