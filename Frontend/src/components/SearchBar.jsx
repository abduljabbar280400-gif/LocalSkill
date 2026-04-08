import { useState, useEffect } from "react";

export default function SearchBar({ filters, setFilters }) {
  const [input, setInput] = useState(filters.search);

  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: input }));
    }, 500);

    return () => clearTimeout(delay);
  }, [input]);

  return (
    <div className="mb-4 flex gap-4">
      <input
        type="text"
        placeholder="Search freelancers..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      />

      <select
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, sort: e.target.value }))
        }
        className="border px-3 py-2 rounded"
      >
        <option value="">Sort</option>
        <option value="rating">Top Rated</option>
        <option value="price_low">Price Low</option>
        <option value="price_high">Price High</option>
      </select>
    </div>
  );
}
