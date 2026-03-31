import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Select from "react-select";
import { useClientAuth } from "../../context/client/useClientAuth";

import CreateProject from "./CreateProject";

import ProposalModal from "../../components/profile/hire-freelancer/ProposalModal";

import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function Projects() {
  const { username } = useParams();
  const { user } = useClientAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    budget_min: "",
    budget_max: "",
    budget_type: "",
    experience_level: "",
    duration: "",
    location: "",
    postal_code: "",
    preferred_work_type: "",
    latitude: null,
    longitude: null,
    deadline: "",
    location_type: "profile",
    status: "",
    skills: [],
  });

  const [categories, setCategories] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  const displayName = user
    ? [user.title, user.first_name, user.last_name].filter(Boolean).join(" ")
    : username;

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState(null);

  const [isProposalOpen, setIsProposalOpen] = useState(false);

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [errors, setErrors] = useState({});

  // ===============================
  // FETCH CLIENT PROJECTS
  // ===============================
  const fetchProjects = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        console.log("👤 Fetching projects for:", username);

        const res = await api.get(
          `/hire-freelancer/${username}/projects?page=${page}`,
        );

        console.log("🔥 API Response:", res.data);

        // Sorted latest first (extra safety)
        const sorted = [...res.data.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        setProjects(sorted);

        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          total: res.data.total,
        });
      } catch (error) {
        console.error("❌ Fetch Error:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    },
    [username],
  );

  useEffect(() => {
    if (username) fetchProjects();
  }, [fetchProjects, username]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const catRes = await api.get("/categories");

        setCategories(catRes.data.data || []);
      } catch (error) {
        console.error("Meta fetch error:", error);
      }
    };

    fetchMeta();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const handleDelete = async (projectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/hire-freelancer/${username}/projects/${projectId}`);

      // Refresh after delete
      fetchProjects(pagination.current_page);
    } catch (error) {
      console.error("❌ Delete Error:", error.response?.data || error);
    }
  };
  // const categoryOptions = categories.map((cat) => ({
  //   value: cat.id,
  //   label: cat.name,
  // }));
  // ===============================
  // EDIT PROJECT
  // ===============================
  const handleEdit = async (project) => {
    setEditingProject(project);

    setFormData({
      title: project.title || "",
      description: project.description || "",
      category_id: project.category_id || "",
      budget_min: project.budget_min || "",
      budget_max: project.budget_max || "",
      budget_type: project.budget_type || "",
      experience_level: project.experience_level || "",
      duration: project.duration || "",
      location: project.location || "",
      postal_code: project.postal_code || "",
      preferred_work_type: project.preferred_work_type || "",

      latitude: project.latitude ? Number(project.latitude) : null,
      longitude: project.longitude ? Number(project.longitude) : null,

      location_type: project.location_type || "profile",
      deadline: project.deadline
        ? new Date(project.deadline).toISOString().slice(0, 10)
        : "",
      status: project.status || "",
      skills: project.skills?.map((skill) => skill.id) || [],
      username: user.username,
    });

    // 🔥 Load skills for existing category
    if (project.category_id) {
      const res = await api.get(`/categories/${project.category_id}/skills`);
      setSkillsList(res.data);
    }

    setShowModal(true);
  };

  const handleUpdate = async (data) => {
    try {
      const cleanedData = { ...data };

      Object.keys(cleanedData).forEach((key) => {
        if (cleanedData[key] === "") {
          delete cleanedData[key];
        }
      });

      console.log("🔥 Sending update:", cleanedData);

      cleanedData.location_type = data.location_type;

      await api.put(
        `/hire-freelancer/${username}/projects/${editingProject.id}`,
        cleanedData,
      );

      setShowModal(false);
      setEditingProject(null);

      fetchProjects(pagination.current_page);
    } catch (error) {
      console.error("❌ Update Error:", error.response?.data || error);
    }
  };

  const handleSort = (field) => {
    let direction = "asc";
    if (sortField === field && sortDirection === "asc") direction = "desc";

    setSortField(field);
    setSortDirection(direction);

    const sorted = [...projects].sort((a, b) => {
      const aVal = a[field] ?? "";
      const bVal = b[field] ?? "";

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setProjects(sorted);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="inline ml-2 text-gray-400" />;
    }

    return sortDirection === "asc" ? (
      <FaSortUp className="inline ml-2 text-indigo-600" />
    ) : (
      <FaSortDown className="inline ml-2 text-indigo-600" />
    );
  };

  const handleCreate = async () => {
    try {
      setErrors({});
      await api.post(`/hire-freelancer/${username}/projects`, formData);

      setShowModal(false);
      fetchProjects(pagination.current_page);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      }
      // console.error("Create Error:", error.response?.data || error);
    }
  };

  // ===============================
  // PAGINATION
  // ===============================
  const renderPagination = () => {
    if (!pagination?.last_page) return null;

    const pages = [];

    for (let i = 1; i <= pagination.last_page; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => fetchProjects(i)}
          disabled={pagination.current_page === i}
          className={
            "pagination-button" +
            (pagination.current_page === i ? " pagination-button-active" : "")
          }
        >
          {i}
        </button>,
      );
    }

    return <div className="pagination">{pages}</div>;
  };

  if (loading) {
    return (
      <main className="app-main">
        <section className="page">
          <div className="container">
            <header className="page-header">
              <h1 className="page-title">Projects</h1>
              <p className="page-subtitle">
                We&apos;re fetching your latest projects and details.
              </p>
            </header>

            <div className="dashboard-panel">
              <div className="loading-page">
                <div className="loading-spinner" />
                <p className="loading-text">Loading your projects...</p>
                <div className="loading-skeleton-row" style={{ width: "100%" }}>
                  <div className="loading-skeleton-strip" />
                  <div className="loading-skeleton-strip" />
                  <div className="loading-skeleton-strip" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-main">
      <section className="page">
        <div className="container">
          <header className="page-header">
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">
              Manage the projects you&apos;ve posted and keep details up to
              date.
            </p>
          </header>

          <div
            className="dashboard-panel"
            style={{
              marginBottom: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p className="dashboard-panel-muted">
              Signed in as <strong>{displayName}</strong>. You currently have{" "}
              <strong>{pagination.total}</strong> project
              {pagination.total === 1 ? "" : "s"}.
            </p>

            {/* ⭐ ADDED CREATE BUTTON */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingProject(null); // ⭐ IMPORTANT (create mode)
                setFormData({
                  title: "",
                  description: "",
                  category_id: "",
                  budget_min: "",
                  budget_max: "",
                  budget_type: "",
                  experience_level: "",
                  duration: "",
                  location: "",
                  postal_code: "",
                  preferred_work_type: "",
                  latitude: null,
                  longitude: null,
                  deadline: "",
                  status: "open",
                  skills: [],
                  location_type: "profile",
                });
                setShowModal(true);
              }}
            >
              + Create Project
            </button>
          </div>

          <div
            className="dashboard-panel backdrop-blur-xl bg-gradient-to-br from-white/60 via-blue-50/40 to-green-50/40 border border-white/30 shadow-xl rounded-2xl"
            style={{ overflowX: "auto" }}
          >
            {projects.length === 0 ? (
              <p className="dashboard-panel-muted">No projects found.</p>
            ) : (
              <table className="table projects-table w-full text-sm backdrop-blur-md">
                <thead className="bg-white/40 backdrop-blur-lg border-b border-white/30">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      #
                    </th>

                    <th
                      onClick={() => handleSort("title")}
                      className="group px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:text-indigo-600"
                    >
                      Title {renderSortIcon("title")}
                    </th>

                    <th
                      onClick={() => handleSort("category_id")}
                      className="group px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:text-indigo-600"
                    >
                      Category {renderSortIcon("category_id")}
                    </th>

                    <th
                      onClick={() => handleSort("experience_level")}
                      className="group px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:text-indigo-600"
                    >
                      Experience {renderSortIcon("experience_level")}
                    </th>

                    <th
                      onClick={() => handleSort("duration")}
                      className="group px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:text-indigo-600"
                    >
                      Duration {renderSortIcon("duration")}
                    </th>

                    <th
                      onClick={() => handleSort("status")}
                      className="group px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:text-indigo-600"
                    >
                      Status {renderSortIcon("status")}
                    </th>

                    <th
                      onClick={() => handleSort("deadline")}
                      className="group px-4 py-3 text-center font-semibold text-gray-700 cursor-pointer hover:text-indigo-600"
                    >
                      Deadline {renderSortIcon("deadline")}
                    </th>

                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => (
                    <tr
                      key={project.id}
                      className="hover:bg-white/40 transition backdrop-blur-sm"
                    >
                      <td>{(pagination.current_page - 1) * 10 + index + 1}</td>
                      <td>{project.title}</td>

                      <td>{project.category?.name || "-"}</td>

                      <td>{project.experience_level || "-"}</td>
                      <td>{project.duration || "-"}</td>
                      <td>
                        <span
                          className={
                            "chip " +
                            (project.status
                              ? `chip-status-${project.status}`
                              : "chip-status-default")
                          }
                        >
                          {project.status || "Unknown"}
                        </span>
                      </td>

                      <td>
                        {project.deadline
                          ? new Date(project.deadline).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleEdit(project)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDelete(project.id)}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setSelectedProjectTitle(project.title);
                              setIsProposalOpen(true);
                            }}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            View Proposals
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <ProposalModal
            username={user.username}
            projectId={selectedProjectId}
            projectTitle={selectedProjectTitle}
            isOpen={isProposalOpen}
            onClose={() => setIsProposalOpen(false)}
          />
          <CreateProject
            showModal={showModal}
            setShowModal={setShowModal}
            editingProject={editingProject}
            setEditingProject={setEditingProject}
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            skillsList={skillsList}
            setSkillsList={setSkillsList}
            skillsLoading={skillsLoading}
            setSkillsLoading={setSkillsLoading}
            handleCreate={handleCreate}
            handleUpdate={handleUpdate}
            errors={errors}
          />

          {renderPagination()}
        </div>
      </section>
    </main>
  );
}
