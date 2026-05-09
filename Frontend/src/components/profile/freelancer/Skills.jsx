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
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
    setIsAdding(true);

    try {
      await api.post(`/freelancer/${username}/skills`, {
        skill_id: selectedSkillId,
        experience_years: experienceYears || 0,
        is_primary: isPrimary,
      });

      // Reset
      setSelectedSkillId("");
      setExperienceYears("");
      setIsPrimary(false);

      await fetchMySkills();
    } finally {
      setIsAdding(false);
    }
  };

  /* ---------------- REMOVE SKILL ---------------- */

  const handleDeleteSkill = async (skillId) => {
    setDeletingId(skillId);
    try {
      await api.delete(`/freelancer/${username}/skills/${skillId}`);
      await fetchMySkills();
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: "120px" }}>
        <div className="common-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {/* ADD SKILL */}
      <h3 className="text-lg font-semibold mb-3">Add Skills</h3>
      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <select
            id="skill-category"
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              setSelectedSkillId("");
            }}
            className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="dark:bg-slate-800">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Skill */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Skill
          </label>
          <select
            id="skill-select"
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            disabled={!selectedCategoryId}
            className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-slate-900/50 transition-all"
          >
            <option value="">Select skill</option>
            {filteredSkills.map((skill) => (
              <option key={skill.id} value={skill.id} className="dark:bg-slate-800">
                {skill.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 items-end">
        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Experience (years)
          </label>
          <input
            id="experience_years"
            type="number"
            placeholder="e.g. 2"
            value={experienceYears}
            min="0"
            onChange={(e) => setExperienceYears(e.target.value)}
            className="w-full border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all"
          />
        </div>

        {/* Primary Toggle */}
        <div 
          onClick={() => setIsPrimary(!isPrimary)}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all h-[50px] ${
            isPrimary 
              ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/50" 
              : "bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700"
          }`}
        >
          <span className={`text-sm font-medium ${isPrimary ? "text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-slate-400"}`}>
            Primary Skill
          </span>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${isPrimary ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-600"}`}>
            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isPrimary ? "translate-x-5" : ""}`} />
          </div>
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={handleAddSkill}
          disabled={!selectedSkillId || isAdding}
          className="btn btn-primary w-full h-[50px] rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isAdding ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><FiPlus className="w-5 h-5" /> Add Skill</>
          )}
        </button>
      </div>

      {/* MY SKILLS */}

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 ">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">My Skills</h3>

        {mySkills.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">No skills added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            {/* HEADER */}
            <div className="grid grid-cols-4 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 border-b dark:border-slate-700">
              <span>Skill</span>
              <span>Experience</span>
              <span>Primary</span>
              <span>Action</span>
            </div>

            {/* ROWS */}
            {mySkills.map((item) => (
              <div
                key={item.skill_id}
                className="grid grid-cols-4 gap-4 items-center px-4 py-3 border-b dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                {/* Skill Name */}
                <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                  {item.skill?.name}
                </span>

                {/* Experience */}
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  {item.experience_years} yrs
                </span>

                {/* Primary */}
                <span className="text-sm">
                  {item.is_primary ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
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
                  disabled={deletingId === item.skill_id}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-fit disabled:opacity-50"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  {deletingId === item.skill_id ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
