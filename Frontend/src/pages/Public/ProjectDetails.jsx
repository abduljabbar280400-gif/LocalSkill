import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";

import { FiX, FiUploadCloud, FiCheckCircle } from "react-icons/fi";

import LocationPicker from "../../components/profile/freelancer/LocationPicker";

export default function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [allProjects, setAllProjects] = useState([]);
  const [relatedProjects, setRelatedProjects] = useState([]);

  const [form, setForm] = useState({
    cover_letter: "",
    proposed_amount: "",
    estimated_duration: "",
    attachment_file: null,
    attachment_link: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [notFound, setNotFound] = useState(false);

  const fetchRelatedProjects = useCallback(async () => {
    try {
      // const res = await api.get("/projects");

      const res = await api.get(`/projects/${slug}/related`);
      setRelatedProjects(res.data);

      console.log("Projects response:", res.data);

      setAllProjects(res.data.data || res.data); // handles both formats
    } catch (err) {
      console.log(err);
    }
  }, [slug]);

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${slug}`);
      console.log(res.data);
      setProject(res.data);
      // check if current freelancer already submitted proposal
      setAlreadyApplied(res.data.has_applied || false);
    } catch (err) {
      if (err.response?.status === 404) {
        setProject(null); // ✅ important
        setNotFound(true);
      } else {
        console.log(err);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // useEffect(() => {
  //   fetchProject();
  //   fetchRelatedProjects();
  // }, [fetchProject, fetchRelatedProjects]);
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (!project || notFound) return; // 🚫 STOP if project not found

    fetchRelatedProjects();
  }, [project, notFound, fetchRelatedProjects]);

  useEffect(() => {
    if (!project || notFound || !Array.isArray(allProjects)) return;

    const scored = allProjects
      .filter((p) => p.id !== project.id)
      .map((p) => {
        let score = 0;

        if (p.category_id === project.category_id) score += 3;
        if (p.experience_level === project.experience_level) score += 2;

        const sharedSkills =
          p.skills?.filter((skill) =>
            project.skills?.some((s) => s.id === skill.id),
          ).length || 0;

        score += sharedSkills * 4;

        if (
          p.budget_min <= project.budget_max &&
          p.budget_max >= project.budget_min
        ) {
          score += 1;
        }

        return { ...p, score };
      })
      .filter((p) => p.score > 0) // ✅ IMPORTANT
      .sort((a, b) => b.score - a.score);

    setRelatedProjects(scored.slice(0, 6));
  }, [project, allProjects]);

  useEffect(() => {
    // Reset states when slug changes
    setProject(null);
    setAlreadyApplied(false);
    setRelatedProjects([]);

    setForm({
      cover_letter: "",
      proposed_amount: "",
      estimated_duration: "",
      attachment_file: null,
      attachment_link: "",
    });

    setLoading(true);
  }, [slug]);

  const [dragActive, setDragActive] = useState(false);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "application/zip",
  ];

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Only PDF, DOC, DOCX, JPG, PNG, ZIP files are allowed.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be less than 5MB.");
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Only PDF, DOC, DOCX, JPG, PNG, ZIP files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be less than 5MB.");
      return;
    }

    setForm({ ...form, attachment_file: file });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setForm({ ...form, attachment_file: file });
  };

  const removeFile = () => {
    setForm({ ...form, attachment_file: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/freelancer/login");
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("cover_letter", form.cover_letter);
      formData.append("proposed_amount", form.proposed_amount);
      formData.append("estimated_duration", form.estimated_duration);

      if (form.attachment_file) {
        formData.append("attachment_file", form.attachment_file);
      }

      if (form.attachment_link) {
        formData.append("attachment_link", form.attachment_link);
      }

      await api.post(`/projects/${project.id}/proposals`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Proposal submitted successfully!");

      setAlreadyApplied(true);

      setForm({
        cover_letter: "",
        proposed_amount: "",
        estimated_duration: "",
        attachment_file: null,
        attachment_link: "",
      });
    } catch (err) {
      if (
        err.response?.data?.message === "You have already submitted a proposal."
      ) {
        setAlreadyApplied(true);
        return;
      }

      alert(err.response?.data?.message || "Failed to submit proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <p className="text-center mt-10"> Loading... </p>;
  if (notFound)
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-300">
          Project not found
        </h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2">
          This project may have been removed or is no longer available.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="md:col-span-2 relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
          <div className="h-full w-full rounded-2xl bg-white dark:bg-slate-800/70 dark:bg-slate-800/80 backdrop-blur-lg border border-white/40 dark:border-slate-700/40 shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">
              {project.title}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400">Category</p>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {project.category?.name}
                </p>
              </div>

              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400">Experience</p>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {project.experience_level}
                </p>
              </div>

              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400">Client</p>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {project.user.first_name} {project.user.last_name}
                </p>
              </div>

              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400">Budget Type</p>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {project.budget_type}
                </p>
              </div>

              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400">Duration</p>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {project.duration}
                </p>
              </div>

              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400">Preferred Work Type</p>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {project.preferred_work_type}
                </p>
              </div>

              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400">Deadline</p>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {formatDate(project.deadline)}
                </p>
              </div>

              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-slate-400">Proposals</p>
                <p className="font-semibold text-gray-800 dark:text-slate-100">
                  {project.proposals_count}
                </p>
              </div>
            </div>

            <div className="p-3 col-span-2">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Location</p>

              {project.latitude && project.longitude ? (
                <LocationPicker
                  postcode={project.postal_code}
                  latitude={project.latitude}
                  longitude={project.longitude}
                  readonly={true}
                  onLocationSelect={() => {}}
                />
              ) : (
                <p className="text-gray-500 dark:text-slate-400">Location not available</p>
              )}

              <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">{project.location}</p>
            </div>

            <hr className="my-6 border-gray-200 dark:border-slate-700" />

            <h3 className="font-semibold text-lg text-gray-800 dark:text-slate-100">Description</h3>

            <p className="mt-3 text-gray-600 dark:text-slate-400 leading-relaxed">
              {project.description}
            </p>

            {project.skills?.length > 0 && (
              <>
                <h4 className="mt-6 font-semibold text-gray-800 dark:text-slate-100 dark:text-slate-100">
                  Skills Required
                </h4>

                <div className="flex flex-wrap gap-2 mt-3">
                  {project.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6 text-green-600 font-semibold text-lg">
              Budget : ₹{project.budget_min} - ₹{project.budget_max}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 h-fit sticky top-24">
          <div className="rounded-2xl bg-white dark:bg-slate-800/70 dark:bg-slate-800/80 backdrop-blur-lg border border-white/40 dark:border-slate-700/40 shadow-lg p-6">
            {!isAuthenticated ? (
              <div className="text-center">
                <p className="text-gray-600 dark:text-slate-400 dark:text-slate-400">
                  You must login to submit proposal.
                </p>

                <button
                  className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition shadow-md"
                  onClick={() => navigate("/freelancer/login")}
                >
                  Login as Freelancer
                </button>
              </div>
            ) : alreadyApplied ? (
              <div className="flex flex-col items-center text-center py-6">
                <FiCheckCircle size={48} className="text-green-500 mb-3" />

                <p className="text-green-600 font-semibold">
                  Proposal Submitted Successfully
                </p>

                <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 text-sm mt-1">
                  You have already applied to this project.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 dark:text-slate-100 mb-4">
                  Submit Proposal
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    placeholder="Cover Letter"
                    value={form.cover_letter}
                    onChange={(e) =>
                      setForm({ ...form, cover_letter: e.target.value })
                    }
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400 outline-none"
                    rows="4"
                  />

                  <input
                    type="number"
                    placeholder="Proposed Amount"
                    value={form.proposed_amount}
                    onChange={(e) =>
                      setForm({ ...form, proposed_amount: e.target.value })
                    }
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Estimated Duration"
                    value={form.estimated_duration}
                    onChange={(e) =>
                      setForm({ ...form, estimated_duration: e.target.value })
                    }
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400 outline-none"
                  />

                  {/* Attachment File (Optional) */}
                  {/* Attachment File (Optional) */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                      Attachment (Optional)
                    </label>

                    {!form.attachment_file ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition
      ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"}`}
                      >
                        <FiUploadCloud
                          size={28}
                          className="text-gray-400 mb-2"
                        />

                        <p className="text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                          Drag & Drop file here or
                        </p>

                        <label className="text-blue-500 font-medium cursor-pointer mt-1">
                          Browse Files
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                        <span className="text-sm text-gray-700 dark:text-slate-300 truncate">
                          {form.attachment_file.name}
                        </span>

                        <button
                          type="button"
                          onClick={removeFile}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm"
                        >
                          <FiX size={16} />
                          Remove
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-gray-400">
                      Allowed: PDF, DOC, DOCX, JPG, PNG, ZIP • Max size: 5MB
                    </p>
                  </div>

                  <input
                    type="url"
                    placeholder="Attachment Link (Optional)"
                    value={form.attachment_link}
                    onChange={(e) =>
                      setForm({ ...form, attachment_link: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-400 outline-none"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Proposal"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      {/* RELATED PROJECTS BOX */}
      {relatedProjects.length > 0 && (
        <div className="max-w-7xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-8">
            Similar Projects You May Like
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProjects.map((rp) => (
              <div
                key={rp.id}
                onClick={() => navigate(`/projects/${rp.slug}`)}
                className="relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 cursor-pointer"
              >
                <div className="h-full w-full rounded-2xl bg-white dark:bg-slate-800/70 dark:bg-slate-800/80 backdrop-blur-lg border border-white/40 dark:border-slate-700/40 shadow-lg p-6 transition hover:shadow-xl hover:-translate-y-[2px]">
                  <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-2">
                    {rp.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    {rp.description?.slice(0, 90)}...
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {rp.skills?.slice(0, 3).map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  {/* Budget */}
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-green-600 font-semibold">
                      ₹{rp.budget_min} - ₹{rp.budget_max}
                    </span>

                    <span className="text-xs text-gray-400">
                      {rp.experience_level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
