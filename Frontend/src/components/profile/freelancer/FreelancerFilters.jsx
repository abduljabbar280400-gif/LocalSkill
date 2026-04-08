import { useEffect, useState } from "react";
import api from "../../../services/api";

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
   * 🔹 Load Skills ONLY when category exists
   */
  useEffect(() => {
    if (!selectedCategory) return; // ✅ just exit, no setState

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
        // ❌ REMOVE skill
        const updatedSkills = prev.skills.filter((id) => id !== skill.id);

        const updatedNames = { ...prev.skillNames };
        delete updatedNames[skill.id];

        return {
          ...prev,
          skills: updatedSkills,
          skillNames: updatedNames,
        };
      } else {
        // ✅ ADD skill
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

  return (
    <div className="w-64 bg-white p-4 rounded-xl shadow overflow-y-auto max-h-[80vh]">
      <h2 className="font-semibold mb-4">Filters</h2>

      {/* Experience */}
      <select
        value={filters.experience}
        className="w-full mb-3 border px-2 py-2 rounded"
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            experience: e.target.value,
          }))
        }
      >
        <option value="">Experience</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="expert">Expert</option>
      </select>

      {/* Rate */}
      <input
        type="number"
        value={filters.min_rate}
        placeholder="Min Rate"
        className="w-full mb-2 border px-2 py-2 rounded"
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
        placeholder="Max Rate"
        className="w-full mb-4 border px-2 py-2 rounded"
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            max_rate: e.target.value,
          }))
        }
      />

      {/* Category */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Category</h3>

        <select
          value={selectedCategory}
          className="w-full border px-2 py-2 rounded"
          onChange={(e) => {
            const value = e.target.value;

            setSelectedCategory(value);

            setFilters((prev) => ({
              ...prev,
              category_id: value,
              skills: [],
            }));

            setSkills([]); // ✅ move reset HERE (event, not effect)
          }}
        >
          <option value="">Select Category</option>

          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Skills */}
      {selectedCategory && skills.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Skills</h3>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const isSelected = filters.skills.includes(skill.id);

              return (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-2 py-1 rounded border ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {skill.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
