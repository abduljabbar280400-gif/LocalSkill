import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Select from "react-select";

import { FaBriefcase } from "react-icons/fa";

import { FiSearch } from "react-icons/fi";

import herobanner from "../../assets/image/top-laptop-comp.jpg";

import ProjectCard from "../../components/ProjectCard";
import useSavedProjects from "../../hooks/useSavedProjects";

dayjs.extend(relativeTime);

export default function Projects() {
  const [projects, setProjects] = useState([]);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(false);

  const [categories, setCategories] = useState([]);

  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);

  const observer = useRef();

  const { isSaved, toggleSave } = useSavedProjects();

  useEffect(() => {
    setProjects([]);
    setPage(1);
    setHasMore(true);
    fetchProjects(1);
  }, [search, categoryId, experienceLevel, minBudget, maxBudget]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");

        // Adjust depending on API response structure
        const categoriesArray = Array.isArray(res.data)
          ? res.data
          : res.data.data;

        const options = categoriesArray.map((cat) => ({
          value: cat.id,
          label: cat.name,
        }));

        setCategories([{ value: "", label: "All Categories" }, ...options]);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const fetchProjects = async (pageNumber) => {
    if (isFetchingRef.current) return; // 🚫 prevent duplicate calls

    try {
      isFetchingRef.current = true;

      if (pageNumber === 1) {
        setLoadingProjects(true);
        setHasMore(true); // reset on new filter
      } else {
        setLoadingMore(true);
      }

      const res = await api.get("/projects", {
        params: {
          page: pageNumber,
          search,
          category_id: categoryId,
          experience_level: experienceLevel,
          min_budget: minBudget,
          max_budget: maxBudget,
        },
      });

      const newProjects = res.data.data;

      setProjects((prev) =>
        pageNumber === 1 ? newProjects : [...prev, ...newProjects],
      );

      setPage(res.data.current_page);

      // ✅ IMPORTANT: stop infinite scroll
      if (res.data.current_page >= res.data.last_page) {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      isFetchingRef.current = false;
      setLoadingProjects(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchInput.length >= 2 || searchInput === "") {
        setSearch(searchInput);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [searchInput]);

  const lastProjectRef = useCallback(
    (node) => {
      if (loadingMore || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
            fetchProjects(page + 1);
          }
        },
        {
          rootMargin: "200px", // 🔥 preload before reaching bottom
        },
      );

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, page],
  );

  const categoryOptions = categories;

  const experienceOptions = [
    { value: "", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "student", label: "Student" },
    { value: "advanced", label: "Advanced" },
  ];

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "50px",
      borderRadius: "1rem", // rounded corners
      borderColor: "#E5E7EB", // gray-200
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // subtle shadow
      paddingLeft: "0.5rem",
      paddingRight: "0.5rem",
      backgroundColor: "white",
      transition: "all 0.2s",
      "&:hover": {
        borderColor: "#3B82F6", // blue-500 on hover
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "1rem", // rounded dropdown
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)", // floating shadow
      marginTop: "4px",
      overflow: "hidden",
      backgroundColor: "white",
      zIndex: 50, // ensure it's above other content
    }),
    menuList: (provided) => ({
      ...provided,
      padding: 0,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#EFF6FF" : "white",
      color: "#1F2937",
      cursor: "pointer",
      padding: "12px 16px",
    }),
  };

  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    {loadingProjects ? (
      <div className="col-span-full text-center text-gray-600 dark:text-slate-400 py-20"> Loading... </div>
    ) : (
      projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          isLast={projects.length === index + 1}
          lastProjectRef={lastProjectRef}
          isSaved={isSaved}
          toggleSave={toggleSave}
        />
      ))
    )}
  </div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative w-full h-[420px] md:h-[480px] overflow-hidden rounded-3xl mb-12">
          {/* Background Image */}
          <img
            src={herobanner}
            alt="Freelancer workspace"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 text-white max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Find Projects That Match Your Skills
            </h1>

            <p className="text-gray-200 text-lg max-w-2xl">
              Browse thousands of freelance projects from clients around the
              world. Filter by category, experience level and budget.
            </p>
          </div>
        </div>

        <div className="sticky top-25 z-20 mb-10">
          <div className="mx-auto max-w-7xl backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/40 shadow-xl rounded-2xl p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search Box */}
              <div className="flex items-center gap-3 flex-1 md:flex-[2] bg-white/90 dark:bg-slate-700/90 rounded-xl px-4 py-3 border border-gray-200 dark:border-slate-600 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
                <FiSearch className="text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search projects,Skills..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full outline-none bg-transparent placeholder-gray-400 text-gray-700 dark:text-slate-300"
                />
              </div>

              <Select
                options={categoryOptions}
                value={categoryOptions.find(
                  (option) => option.value === categoryId,
                )}
                onChange={(selected) => setCategoryId(selected?.value || "")}
                placeholder="Select Category"
                isSearchable
                styles={customSelectStyles}
              />

              <Select
                options={experienceOptions}
                value={experienceOptions.find(
                  (option) => option.value === experienceLevel,
                )}
                onChange={(selected) =>
                  setExperienceLevel(selected?.value || "")
                }
                placeholder="Select Experience Level"
                isSearchable
                styles={customSelectStyles}
              />

              {/* Budget Inputs */}
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  className="w-1/2 md:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 shadow-sm focus:ring-2 focus:ring-blue-400 transition"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-1/2 md:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 shadow-sm focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loadingProjects ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                  className="animate-pulse group relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900"
              >
                <div className="h-full w-full rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border border-white/40 dark:border-slate-700/40 shadow-lg p-6 flex flex-col gap-4">
                  <div className="h-4 w-1/3 bg-gray-300 rounded-full"></div>
                  <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
                  <div className="flex justify-between gap-2">
                    <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                    <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex justify-between gap-2">
                    <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                    <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : projects.length === 0 ? (
            // ✅ EMPTY STATE UI
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <FaBriefcase className="text-5xl text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 dark:text-slate-300">
                No Projects Found
              </h2>
              <p className="text-gray-500 dark:text-slate-400 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                isLast={projects.length === index + 1}
                lastProjectRef={lastProjectRef}
                isSaved={isSaved}
                toggleSave={toggleSave}
              />
            ))
          )}
        </div>

        {loadingMore && (
          <div className="text-center text-gray-600 dark:text-slate-400 mt-10"> Loading... </div>
        )}

        {!hasMore && !loadingProjects && projects.length > 0 && (
          <div className="text-center text-gray-500 dark:text-slate-500 mt-10">
            You have reached the end
          </div>
        )}
      </div>
    </div>
  );
}
