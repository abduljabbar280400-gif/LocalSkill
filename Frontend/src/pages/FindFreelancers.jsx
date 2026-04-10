import { useEffect, useState } from "react";
import api from "../services/api";
import FreelancerList from "../components/profile/freelancer/FreelancerList";
import FreelancerFilters from "../components/profile/freelancer/FreelancerFilters";
import SelectedFilters from "../components/profile/freelancer/SelectedFilters";
import SearchBar from "../components/SearchBar";
import heroImage from "../assets/image/Freelancer-Hero.jpg";

import { FiSliders, FiX } from "react-icons/fi";

export default function FindFreelancers() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [closing, setClosing] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    experience: "",
    min_rate: "",
    max_rate: "",
    sort: "",
    skills: [],
    category_id: "",
    skillNames: {},
  });

  // ✅ Debounce search
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  // ✅ Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedFilters]);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/freelancers", {
        params: {
          ...debouncedFilters,
          page,
        },
      });

      setFreelancers(response.data.data.data);
      setMeta(response.data.data);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, [debouncedFilters, page]);

  const handleCloseFilters = () => {
    setClosing(true);

    setTimeout(() => {
      setShowMobileFilters(false);
      setClosing(false);
    }, 300); // match animation duration
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* 🔥 HERO SEARCH SECTION */}
      {/* 🔥 HERO BANNER */}
      <div className="relative w-full h-[300px] md:h-[350px] lg:h-[400px]">
        {/* BACKGROUND IMAGE */}
        <img
          src={heroImage}
          alt="Find Freelancers"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />

        {/* CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col justify-center text-white">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Find the perfect freelancer for your project
          </h1>

          <p className="text-gray-200 mb-6 max-w-xl">
            Discover skilled professionals ready to bring your ideas to life
          </p>

          {/* SEARCH */}
          <div className="max-w-2xl">
            <SearchBar filters={filters} setFilters={setFilters} />
          </div>

          {/* SELECTED FILTERS */}
          <div className="mt-3">
            <SelectedFilters filters={filters} setFilters={setFilters} />
          </div>
        </div>
      </div>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* 🧊 SIDEBAR (Sticky) */}
        <div className="w-72 hidden lg:block sticky top-28 h-fit">
          <FreelancerFilters filters={filters} setFilters={setFilters} />
        </div>

        {/* 📄 CONTENT */}
        <div className="flex-1">
          {/* 📊 RESULT HEADER */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {loading
                ? "Loading freelancers..."
                : `Showing ${meta.total || 0} freelancers`}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:block">
                Sort by:
              </span>

              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sort: e.target.value,
                  }))
                }
                className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
              >
                <option value="">Recommended</option>
                <option value="latest">Latest</option>
                <option value="rating">Top Rated</option>
                <option value="price_low">Price: Low → High</option>
                <option value="price_high">Price: High → Low</option>
              </select>
            </div>
          </div>

          {/* 💀 EMPTY STATE */}
          {!loading && freelancers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl ">
              <h2 className="text-xl font-semibold mb-2">
                No freelancers found 😕
              </h2>
              <p className="text-gray-500">
                Try adjusting your filters or search keywords
              </p>
            </div>
          )}

          {/* ⏳ LOADING STATE */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : (
            <FreelancerList freelancers={freelancers} />
          )}

          {/* 🔁 PAGINATION */}
          {!loading && freelancers.length > 0 && (
            <div className="flex justify-center items-center mt-8 gap-3">
              <button
                disabled={!meta.prev_page_url}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Prev
              </button>

              <span className="text-sm text-gray-600">
                Page {meta.current_page || 1}
              </span>

              <button
                disabled={!meta.next_page_url}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Next
              </button>
            </div>
          )}

          {/* 📱 MOBILE FILTER BUTTON */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden fixed bottom-6 right-6 z-[51] bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition"
          >
            <FiSliders size={20} />
          </button>

          {/* 📱 MOBILE FILTER MODAL */}
          {showMobileFilters && (
            <>
              {/* BACKDROP */}
              <div
                className="fixed inset-0 bg-black/40 z-[50]"
                onClick={handleCloseFilters}
              />

              {/* DRAWER */}
              <div
                className={`fixed bottom-0 left-0 right-0 z-[51] rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto ${
                  closing ? "animate-slideDown" : "animate-slideUp"
                }`}
              >
                {/* FILTER CONTENT */}
                <div className="p-4">
                  <FreelancerFilters
                    filters={filters}
                    setFilters={setFilters}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <style>
        {`
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}

.animate-slideDown {
  animation: slideDown 0.3s ease-in forwards;
}
`}
      </style>
    </div>
  );
}
