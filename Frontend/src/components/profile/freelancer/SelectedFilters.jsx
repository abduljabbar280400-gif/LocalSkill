export default function SelectedFilters({ filters, setFilters }) {
  const removeFilter = (key, value = null) => {
    setFilters((prev) => {
      if (key === "skills") {
        return {
          ...prev,
          skills: prev.skills.filter((id) => id !== value),
        };
      }

      return {
        ...prev,
        [key]: "",
      };
    });
  };

  const clearAll = () => {
    setFilters({
      search: "",
      experience: "",
      min_rate: "",
      max_rate: "",
      sort: "",
      skills: [],
      category_id: "",
    });
  };

  const hasFilters =
    filters.search ||
    filters.experience ||
    filters.min_rate ||
    filters.max_rate ||
    filters.skills.length > 0;

  if (!hasFilters) return null;

  return (
    <div className="mb-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow flex flex-wrap gap-2 items-center">
      {/* Experience */}
      {filters.experience && (
        <Chip
          label={filters.experience}
          onRemove={() => removeFilter("experience")}
        />
      )}

      {/* Rate */}
      {(filters.min_rate || filters.max_rate) && (
        <Chip
          label={`₹ ${filters.min_rate || 0} - ₹ ${filters.max_rate || "∞"}`}
          onRemove={() => {
            removeFilter("min_rate");
            removeFilter("max_rate");
          }}
        />
      )}

      {/* Skills */}
      {filters.skills.map((skillId) => (
        <Chip
          key={skillId}
          label={filters.skillNames?.[skillId] || `Skill #${skillId}`}
          onRemove={() => removeFilter("skills", skillId)}
        />
      ))}

      {/* Clear All */}
      <button onClick={clearAll} className="ml-auto text-sm text-red-500">
        Clear All
      </button>
    </div>
  );
}

/**
 * 🔹 Reusable Chip
 */
function Chip({ label, onRemove }) {
  return (
    <div className="flex items-center gap-2 bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full text-sm">
      {label}
      <button onClick={onRemove} className="text-red-500 font-bold">
        ✕
      </button>
    </div>
  );
}
