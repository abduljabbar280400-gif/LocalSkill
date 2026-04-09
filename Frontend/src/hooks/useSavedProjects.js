import { useEffect, useState } from "react";
import axios from "../services/api";

export default function useSavedProjects() {
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch saved projects
  const fetchSavedProjects = async () => {
    try {
      const res = await axios.get("/saved-projects");
      setSavedProjects(res.data);
    } catch (err) {
      console.error("Fetch saved projects error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedProjects();
  }, []);

  // 🔥 Toggle Save (Optimistic UI)
  const toggleSave = async (projectId) => {
    const isSaved = savedProjects.some(
      (p) => p.project_id === projectId
    );

    // ✅ Optimistic update
    if (isSaved) {
      setSavedProjects((prev) =>
        prev.filter((p) => p.project_id !== projectId)
      );
    } else {
      setSavedProjects((prev) => [
        ...prev,
        { project_id: projectId },
      ]);
    }

    try {
      await axios.post(`/saved-projects/${projectId}`);
    } catch (err) {
      console.error("Toggle save failed", err);

      // ❌ rollback if failed
      fetchSavedProjects();
    }
  };

  const isSaved = (projectId) => {
    return savedProjects.some((p) => p.project_id === projectId);
  };

  return {
    savedProjects,
    loading,
    toggleSave,
    isSaved,
  };
}