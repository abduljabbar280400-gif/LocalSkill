import { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams } from "react-router-dom";
import FreelancerCard from "../../components/profile/freelancer/FreelancerCard";

export default function SavedFreelancers() {
  const { username } = useParams();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedFreelancers = async () => {
    try {
      const res = await api.get(
        `/hire-freelancer/${username}/saved-freelancers`,
      );
      setFreelancers(res.data);
    } catch (err) {
      console.error("Error fetching saved freelancers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedFreelancers();
  }, []);

  // 🔄 Loading State
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-slate-400"> Loading... </div>
    );
  }

  // ❌ Empty State
  if (freelancers.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">No saved freelancers</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2">
          Start saving freelancers to see them here.
        </p>
      </div>
    );
  }

  const handleRemove = (profileId) => {
    setFreelancers((prev) =>
      prev.filter((f) => (f.profile_id || f.id) !== profileId),
    );
  };

  // ✅ Data UI
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Saved Freelancers</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freelancers.map((freelancer) => (
          <FreelancerCard
            key={freelancer.profile_id || freelancer.id}
            freelancer={freelancer}
            isSavedPage={true}
            onRemove={handleRemove} // 🔥 new prop
          />
        ))}
      </div>
    </div>
  );
}
