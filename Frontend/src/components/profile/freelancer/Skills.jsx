import { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";

import { FaCheckCircle } from "react-icons/fa";
import { FiTrash2, FiPlus } from "react-icons/fi";

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
    <div className="space-y-6 mt-6">
      {/* ADD SKILL */}
      <h3 className="text-lg font-semibold mb-3">Add Skills</h3>
      <div className="grid md:grid-cols-2 gap-5 mb-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Category
          </label>
          <select
            id="skill-category"
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              setSelectedSkillId("");
            }}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:outline-none"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Skill */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Skill
          </label>
          <select
            id="skill-select"
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            disabled={!selectedCategoryId}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:outline-none disabled:bg-gray-100"
          >
            <option value="">Select skill</option>
            {filteredSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-4">
          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Experience (years)
            </label>
            <input
              id="experience_years"
              type="number"
              placeholder="e.g. 2"
              value={experienceYears}
              min="0"
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          {/* Primary */}
          <div className="flex items-center gap-3 mt-6">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 accent-black"
            />
            <span className="text-sm text-gray-600">
              Mark as <span className="font-semibold">Primary Skill</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddSkill}
          disabled={!selectedSkillId}
          className="btn btn-outline"
        >
          <FiPlus /> Add Skill
        </button>
      </div>
      {/* MY SKILLS */}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 ">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Skills</h3>

        {mySkills.length === 0 ? (
          <p className="text-sm text-gray-500">No skills added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            {/* HEADER */}
            <div className="grid grid-cols-4 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 border-b">
              <span>Skill</span>
              <span>Experience</span>
              <span>Primary</span>
              <span>Action</span>
            </div>

            {/* ROWS */}
            {mySkills.map((item) => (
              <div
                key={item.skill_id}
                className="grid grid-cols-4 gap-4 items-center px-4 py-3 border-b hover:bg-gray-50 transition"
              >
                {/* Skill Name */}
                <span className="text-sm font-medium text-gray-800">
                  {item.skill?.name}
                </span>

                {/* Experience */}
                <span className="text-sm text-gray-600">
                  {item.experience_years} yrs
                </span>

                {/* Primary */}
                <span className="text-sm">
                  {item.is_primary ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <FaCheckCircle className="text-green-500" />
                      Primary
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </span>

                {/* Action */}
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(item.skill_id)}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition w-fit"
                >
                  <FiTrash2 />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
