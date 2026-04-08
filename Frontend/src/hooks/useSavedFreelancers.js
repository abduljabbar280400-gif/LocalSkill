import { useEffect, useState } from "react";
import api from "../services/api";

export default function useSavedFreelancers() {
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved freelancers
  const fetchSaved = async () => {
    try {
      const res = await api.get("/saved-freelancers");
      setSavedIds(res.data);
    } catch (err) {
      console.error("Fetch saved error:", err);
    }finally {
      setLoading(false); // ✅ done loading
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  // Toggle save/unsave
  const toggleSave = async (freelancerId) => {
    if (!freelancerId) {
    console.error("❌ Invalid freelancerId:", freelancerId);
    return; // 🚫 STOP API CALL
  }
    const isSaved = savedIds.includes(freelancerId);

    // Optimistic UI update
    setSavedIds((prev) =>
      isSaved
        ? prev.filter((id) => id !== freelancerId)
        : [...prev, freelancerId]
    );

    try {
    //   setLoading(true);

      if (isSaved) {
        await api.delete(`/saved-freelancers/${freelancerId}`);
      } else {
        await api.post(`/saved-freelancers/${freelancerId}`);
      }
    } catch (err) {
      console.error("Toggle save error:", err);

      // rollback if failed
      setSavedIds((prev) =>
        isSaved
          ? [...prev, freelancerId]
          : prev.filter((id) => id !== freelancerId)
      );
    } 
  };

  return {
    savedIds,
    toggleSave,
    loading,
  };
}