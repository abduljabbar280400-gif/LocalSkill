import { useEffect, useState } from "react";
import api from "../services/api";
import FreelancerList from "../components/profile/freelancer/FreelancerList";
import FreelancerFilters from "../components/profile/freelancer/FreelancerFilters";
import SelectedFilters from "../components/profile/freelancer/SelectedFilters";
import SearchBar from "../components/SearchBar";

export default function FindFreelancers() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);

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

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/freelancers", {
        params: {
          ...filters,
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
  }, [filters, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search + Filters */}
      <div className="mb-4">
        <SearchBar filters={filters} setFilters={setFilters} />
        <SelectedFilters filters={filters} setFilters={setFilters} />
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <FreelancerFilters filters={filters} setFilters={setFilters} />

        {/* List */}
        <div className="flex-1">
          <FreelancerList freelancers={freelancers} loading={loading} />
        </div>
      </div>
      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          disabled={!meta.prev_page_url}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <button
          disabled={!meta.next_page_url}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
