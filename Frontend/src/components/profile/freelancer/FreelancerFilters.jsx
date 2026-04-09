import { useEffect, useState } from "react";
import api from "../../../services/api";
import { FiFilter, FiRefreshCw } from "react-icons/fi";

export default function FreelancerFilters({ filters, setFilters }) {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  /**
   * 🔹 Load Categories
   */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    loadCategories();
  }, []);

  /**
   * 🔹 Load Skills when category changes
   */
  useEffect(() => {
    if (!selectedCategory) return;

    const loadSkills = async () => {
      try {
        const res = await api.get(`/categories/${selectedCategory}/skills`);
        setSkills(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    };

    loadSkills();
  }, [selectedCategory]);

  /**
   * 🔹 Toggle Skill
   */
  const toggleSkill = (skill) => {
    setFilters((prev) => {
      const exists = prev.skills.includes(skill.id);

      if (exists) {
        const updatedSkills = prev.skills.filter((id) => id !== skill.id);
        const updatedNames = { ...prev.skillNames };
        delete updatedNames[skill.id];

        return {
          ...prev,
          skills: updatedSkills,
          skillNames: updatedNames,
        };
      } else {
        return {
          ...prev,
          skills: [...prev.skills, skill.id],
          skillNames: {
            ...prev.skillNames,
            [skill.id]: skill.name,
          },
        };
      }
    });
  };

  /**
   * 🔹 Clear Filters
   */
  const clearFilters = () => {
    setSelectedCategory("");
    setSkills([]);

    setFilters({
      search: "",
      experience: "",
      min_rate: "",
      max_rate: "",
      sort: "",
      skills: [],
      category_id: "",
      skillNames: {},
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600" />
          <h2 className="font-semibold text-lg">Filters</h2>
        </div>

        <button
          onClick={clearFilters}
          className="text-sm flex items-center gap-1 text-gray-500 hover:text-red-500"
        >
          <FiRefreshCw size={14} />
          Clear
        </button>
      </div>

      {/* EXPERIENCE */}
      <div className="mb-5">
        <h3 className="text-sm font-medium mb-2 text-gray-700">
          Experience Level
        </h3>

        <select
          value={filters.experience}
          className="w-full bg-gray-100 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              experience: e.target.value,
            }))
          }
        >
          <option value="">All Levels</option>
          <option value="student">Student</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Expert</option>
        </select>
      </div>

      {/* RATE */}
      <div className="mb-5">
        <h3 className="text-sm font-medium mb-2 text-gray-700">Hourly Rate</h3>

        <div className="flex gap-2">
          <input
            type="number"
            value={filters.min_rate}
            placeholder="Min"
            className="w-1/2 bg-gray-100 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                min_rate: e.target.value,
              }))
            }
          />

          <input
            type="number"
            value={filters.max_rate}
            placeholder="Max"
            className="w-1/2 bg-gray-100 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                max_rate: e.target.value,
              }))
            }
          />
        </div>
      </div>

      {/* CATEGORY */}
      <div className="mb-5">
        <h3 className="text-sm font-medium mb-2 text-gray-700">Category</h3>

        <select
          value={selectedCategory}
          className="w-full bg-gray-100 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          onChange={(e) => {
            const value = e.target.value;

            setSelectedCategory(value);

            setFilters((prev) => ({
              ...prev,
              category_id: value,
              skills: [],
              skillNames: {},
            }));

            setSkills([]);
          }}
        >
          <option value="">All Categories</option>

          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* SKILLS */}
      {selectedCategory && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-700">Skills</h3>

          {skills.length === 0 ? (
            <p className="text-xs text-gray-400">Loading skills...</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {skills.map((skill) => {
                const isSelected = filters.skills.includes(skill.id);

                return (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      isSelected
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
