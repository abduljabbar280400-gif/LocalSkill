import { useEffect } from "react";
// import { useParams } from "react-router-dom";

import useSavedProjects from "../../hooks/useSavedProjects";
import ProjectCard from "../../components/ProjectCard";

import { FaBriefcase } from "react-icons/fa";

export default function SavedProjects() {
  //   const { username } = useParams();

  const { savedProjects, loading, toggleSave, isSaved } = useSavedProjects();

  // Optional: scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-200">
            Saved Projects
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Projects you bookmarked for later
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20 text-gray-600 dark:text-slate-400"> Loading... </div>
        ) : savedProjects.length === 0 ? (
          // ✅ Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FaBriefcase className="text-5xl text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-slate-300">
              No Saved Projects
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2">
              Save projects to view them here later
            </p>
          </div>
        ) : (
          // ✅ Projects Grid
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {savedProjects.map((item) => {
              const project = item.project;

              // ⚠️ Safety check
              if (!project) return null;

              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isLast={false}
                  lastProjectRef={null}
                  isSaved={isSaved}
                  toggleSave={toggleSave}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
