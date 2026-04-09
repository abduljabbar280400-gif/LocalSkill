import { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({ filters, setFilters }) {
  const [input, setInput] = useState(filters.search);

  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: input }));
    }, 500);

    return () => clearTimeout(delay);
  }, [input]);

  return (
    <div className="mb-6 flex flex-col md:flex-row gap-3">
      {/* 🔍 SEARCH INPUT */}
      <div className="flex items-center flex-1 bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl px-6 py-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
        <FiSearch className="text-gray-500 mr-2" />

        <input
          type="text"
          placeholder="Search by freelancer name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-black"
        />

        {/* ❌ CLEAR BUTTON */}
        {input && (
          <button
            onClick={() => setInput("")}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <FiX size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
