import { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import { Link } from "react-router-dom";

import {
  FiPaperclip,
  FiExternalLink,
  FiCalendar,
  FiClock,
  FiDownload,
  FiFileText,
  FiImage,
  FiArchive,
  FiFilter,
  FiTrendingUp,
  FiChevronDown,
  FiStar,
} from "react-icons/fi";

const ProposalModal = ({
  username,
  projectId,
  isOpen,
  onClose,
  projectTitle,
}) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeFilter, setActiveFilter] = useState("all");
  const [contractLoading, setContractLoading] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [ratingFilter, setRatingFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [contracts, setContracts] = useState([]);

  const fetchContracts = useCallback(async () => {
    try {
      const res = await api.get(
        `/hire-freelancer/${username}/projects/${projectId}/contracts`,
      );

      setContracts(res.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [projectId, username]);

  const fetchProposals = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const params = {
          page,
          status: activeFilter,
          sort_by: sortBy,
          sort_direction: sortDirection,
          rating: ratingFilter,
          date_filter: dateFilter,
        };

        const res = await api.get(
          `/hire-freelancer/${username}/projects/${projectId}/proposals`,
          { params },
        );

        setProposals(res.data.proposals || []);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [
      projectId,
      username,
      activeFilter,
      sortBy,
      sortDirection,
      ratingFilter,
      dateFilter,
    ],
  );

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProposals();
      fetchContracts();
    }
  }, [isOpen, projectId, fetchProposals, fetchContracts]);

  useEffect(() => {
    if (!isOpen) {
      setProposals([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProposals = proposals; // Now handled by backend

  const StatusButton = ({
    label,
    value,
    proposal,
    updateStatus,
    activeColor,
  }) => {
    const isActive = proposal.status === value;
    const isLocked = proposal.status === "accepted" && value !== "accepted";
    const isUpdating = updatingStatusId === proposal.id;

    return (
      <button
        type="button"
        disabled={isLocked || isUpdating}
        onClick={() => updateStatus(proposal, value)}
        className={`
        px-4 py-1.5 text-sm rounded-full border transition-all duration-200
        ${
          isActive
            ? `${activeColor} text-white border-transparent`
            : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:bg-slate-800"
        }
        ${isLocked ? "opacity-40 cursor-not-allowed hover:bg-white dark:bg-slate-800" : ""}
      `}
      >
        {label}
      </button>
    );
  };

  const updateStatus = async (proposal, newStatus) => {
    if (newStatus === "accepted") {
      const freelancerName = `${proposal.freelancer.first_name} ${proposal.freelancer.last_name}`;
      const confirmed = window.confirm(
        `Are you sure to Accept this '${freelancerName}' and set other user's to Rejected?`,
      );
      if (!confirmed) return;
    }

    try {
      setUpdatingStatusId(proposal.id);
      await api.put(`/proposals/${proposal.id}`, {
        status: newStatus,
      });

      // Update local proposals
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id === proposal.id) {
            return { ...p, status: newStatus };
          }
          // If we accepted one, reject others
          if (newStatus === "accepted") {
            return { ...p, status: "rejected" };
          }
          return p;
        }),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "shortlisted":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300";
    }
  };

  const prepareContract = async (proposal) => {
    try {
      setContractLoading(proposal.id);

      const payload = {
        proposal_id: proposal.id,
        start_date: "2026-03-10",
        end_date: "2026-04-10",
      };

      const res = await api.post(
        `/hire-freelancer/${username}/projects/${proposal.project_id}/contracts`,
        payload,
      );

      const contract = res.data.contract;

      // Open React contract page
      window.open(
        `/hire-freelancer/${username}/contracts/${contract.id}`,
        "_blank",
      );
    } catch (error) {
      console.error("Contract Error:", error.response?.data || error.message);
    } finally {
      setContractLoading(null);
    }
  };

  const getContractForProposal = (proposalId) => {
    return contracts.find((c) => c.proposal_id === proposalId);
  };

  const getFileInfo = (filePath) => {
    if (!filePath) return null;

    const extension = filePath.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return { label: "PDF", icon: <FiFileText size={18} /> };

      case "png":
      case "jpg":
      case "jpeg":
      case "webp":
        return { label: "Image", icon: <FiImage size={18} /> };

      case "zip":
      case "rar":
        return { label: "Archive", icon: <FiArchive size={18} /> };

      case "doc":
      case "docx":
        return { label: "Word Document", icon: <FiFileText size={18} /> };

      default:
        return {
          label: extension.toUpperCase(),
          icon: <FiPaperclip size={18} />,
        };
    }
  };

  const getFileName = (filePath) => {
    return filePath.split("/").pop();
  };

  console.log(proposals);

  return (
    <div className="proposal-overlay" onClick={onClose}>
      <div className="proposal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-200">
            Proposals for:
            <span className="ml-2 text-blue-600">{projectTitle}</span>
          </h2>

          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {proposals.length} Applications
          </p>

          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close Proposal Modal"
          >
            ×
          </button>
        </div>

        <div className="sticky top-0 z-20 my-5 flex  backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 border-b border-white/20 dark:border-slate-700/20 rounded-2xl shadow-sm">
          <div className="flex justify-between w-full gap-3 overflow-x-auto px-4 py-4 scrollbar-hide">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "accepted", label: "Accepted" },
              { key: "rejected", label: "Rejected" },
              { key: "shortlisted", label: "Shortlisted" },
            ].map((tab) => {
              const count =
                tab.key === "all"
                  ? proposals.length
                  : proposals.filter((p) => p.status === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={` relative px-6 py-2.5 rounded-full text-sm font-semibold 
                    transition-all duration-300 border overflow-hidden${
                      activeFilter === tab.key
                        ? "text-white border-transparent shadow-lg scale-105 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 btn-proposal"
                        : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-white dark:bg-slate-800"
                    }`}
                >
                  {tab.label}

                  <span
                    key={count}
                    className={`ml-2 px-2.5 py-0.5 text-xs rounded-full font-semibold
                        transition-all duration-300 animate-bounce-in
                        ${getBadgeColor(tab.key)}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ✅ Skeleton Loader */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="loading-skeleton-row w-1/2">
                    <div className="loading-skeleton-strip w-32"></div>
                    <div className="loading-skeleton-strip w-40"></div>
                  </div>
                  <div className="loading-skeleton-strip w-16"></div>
                </div>

                <div className="loading-skeleton-row">
                  <div className="loading-skeleton-strip w-full"></div>
                  <div className="loading-skeleton-strip w-5/6"></div>
                  <div className="loading-skeleton-strip w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filteredProposals.length === 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-slate-400">
            No {activeFilter !== "all" ? activeFilter : ""} proposals found.
          </div>
        )}

        {/* Proposal List */}
        {!loading && filteredProposals.length > 0 && (
          <div className="space-y-8">
            {/* Section Title */}
            {/* Section Title & Controls */}
            {/* Streamlined Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-4 px-6 rounded-[2rem] border border-white/20 dark:border-slate-700/30 shadow-xl shadow-indigo-500/5">
              {/* Left: Stats */}
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                  <FiFileText className="text-white w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-200">
                    {pagination.total}{" "}
                    <span className="text-gray-500 dark:text-slate-400 font-medium">
                      Applications
                    </span>
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Sort Group */}
                <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 p-1 pl-3 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                  <FiTrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <div className="relative group">
                    <select
                      value={`${sortBy}:${sortDirection}`}
                      onChange={(e) => {
                        const [field, dir] = e.target.value.split(":");
                        setSortBy(field);
                        setSortDirection(dir);
                      }}
                      className="appearance-none bg-transparent pr-7 py-1 text-xs font-bold text-gray-700 dark:text-slate-200 outline-none cursor-pointer [&>option]:bg-white [&>option]:dark:bg-slate-900"
                    >
                      <option value="created_at:desc">Newest</option>
                      <option value="created_at:asc">Oldest</option>
                      <option value="proposed_amount:asc">Budget ↑</option>
                      <option value="proposed_amount:desc">Budget ↓</option>
                      <option value="completed_jobs:desc">Exp.</option>
                      <option value="average_rating:desc">Rating</option>
                    </select>
                    <FiChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3 h-3" />
                  </div>
                </div>

                {/* Filter Group */}
                <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 p-1 pl-3 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                  <FiFilter className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />

                  {/* Rating */}
                  <div className="relative group">
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className="appearance-none bg-transparent pr-7 py-1 text-xs font-bold text-gray-700 dark:text-slate-200 outline-none cursor-pointer [&>option]:bg-white [&>option]:dark:bg-slate-900"
                    >
                      <option value="">Ratings</option>
                      <option value="4">4+ ★</option>
                      <option value="3">3+ ★</option>
                      <option value="2">2+ ★</option>
                    </select>
                    <FiStar className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none w-3 h-3" />
                  </div>

                  <div className="h-3 w-px bg-gray-200 dark:bg-slate-700 mx-0.5"></div>

                  {/* Date */}
                  <div className="relative group">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="appearance-none bg-transparent pr-7 py-1 text-xs font-bold text-gray-700 dark:text-slate-200 outline-none cursor-pointer [&>option]:bg-white [&>option]:dark:bg-slate-900"
                    >
                      <option value="">Time</option>
                      <option value="today">Today</option>
                      <option value="last_7_days">Week</option>
                      <option value="this_month">Month</option>
                    </select>
                    <FiCalendar className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-6">
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className={`relative rounded-3xl p-7 border transition-all duration-300
          ${
            proposal.status === "accepted"
              ? "border-green-500 dark:border-green-600 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 shadow-lg"
              : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-xl hover:-translate-y-1"
          }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6 ">
                    <div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 pl-1">
                          {proposal.freelancer.first_name}{" "}
                          {proposal.freelancer.last_name}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        {/* View Profile Button */}
                        <Link
                          to={`/freelancer/${proposal.freelancer.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-2 px-4 py-1.5
  text-xs font-medium rounded-xl
  border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300
  hover:border-blue-600 hover:text-blue-600
  hover:bg-blue-50
  transition-all duration-200"
                        >
                          View Profile
                        </Link>
                        <span className="mx-2">•</span>⭐{" "}
                        {proposal.freelancer.freelancer_profile
                          ?.average_rating ?? 0}
                        <span className="mx-2">•</span>
                        {proposal.freelancer.freelancer_profile
                          ?.completed_jobs ?? 0}{" "}
                        jobs
                      </p>
                    </div>

                    <div className="px-4 py-1.5 bg-gray-900 text-white text-sm font-semibold rounded-full shadow-sm">
                      ₹ {proposal.proposed_amount}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                        Estimated Duration
                      </p>
                      <div className="text-sm font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                        <FiClock size={16} />
                        {proposal.estimated_duration} days
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                        Applied On
                      </p>
                      <div className="text-sm font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                        <FiCalendar size={16} />
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Attachments */}
                    {/* Attachments */}
                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700 col-span-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                        Attachments
                      </p>

                      {proposal.attachment_file ? (
                        (() => {
                          const file = getFileInfo(proposal.attachment_file);
                          const fileName = getFileName(
                            proposal.attachment_file,
                          );
                          const fileUrl = `http://localhost:8000/storage/${proposal.attachment_file}`;

                          return (
                            <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3">
                              {/* File Info */}
                              <div className="flex items-center gap-3">
                                <div className="text-gray-700 dark:text-slate-300">{file.icon}</div>

                                <div>
                                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                                    {fileName}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {file.label}
                                    {proposal.attachment_size && (
                                      <span className="ml-2">
                                        • {proposal.attachment_size}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Buttons */}
                              <div className="flex items-center gap-5">
                                {/* View */}
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <FiPaperclip size={14} />
                                  View
                                </a>

                                {/* Download */}
                                <a
                                  href={fileUrl}
                                  download
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg
              bg-gray-200 dark:bg-slate-700 text-white hover:bg-gray-300 transition"
                                >
                                  <FiDownload size={14} />
                                  Download
                                </a>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-sm text-gray-400">
                          No file attachment
                        </span>
                      )}

                      {/* External Link */}
                      {proposal.attachment_link && (
                        <a
                          href={proposal.attachment_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 mt-3 text-sm font-medium text-indigo-600 hover:underline"
                        >
                          <FiExternalLink size={16} />
                          Open Portfolio / Demo Link
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      Cover Letter
                    </p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {proposal.cover_letter}
                    </p>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                    {/* Status Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <StatusButton
                        label="Pending"
                        value="pending"
                        proposal={proposal}
                        updateStatus={updateStatus}
                        activeColor="bg-yellow-500"
                      />

                      <StatusButton
                        label="Shortlisted"
                        value="shortlisted"
                        proposal={proposal}
                        updateStatus={updateStatus}
                        activeColor="bg-blue-600"
                      />

                      <StatusButton
                        label="Accepted"
                        value="accepted"
                        proposal={proposal}
                        updateStatus={updateStatus}
                        activeColor="bg-green-600"
                      />

                      <StatusButton
                        label="Rejected"
                        value="rejected"
                        proposal={proposal}
                        updateStatus={updateStatus}
                        activeColor="bg-red-500"
                      />
                    </div>

                    {/* Prepare Contract Button (Right Side) */}
                    {proposal.status === "accepted" &&
                      (() => {
                        const contract = getContractForProposal(proposal.id);

                        if (contract) {
                          return (
                            <button
                              onClick={() =>
                                window.open(
                                  `/hire-freelancer/${username}/contracts/${contract.id}`,
                                  "_blank",
                                )
                              }
                              className="px-5 py-2 text-sm font-medium rounded-xl
        bg-blue-600 text-white shadow-sm
        hover:bg-blue-700 transition-all duration-200"
                            >
                              Show Contract
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={() => prepareContract(proposal)}
                            className="px-5 py-2 text-sm font-medium rounded-xl
      bg-emerald-600 text-white shadow-sm
      hover:bg-emerald-700 transition-all duration-200"
                            disabled={contractLoading === proposal.id}
                          >
                            {contractLoading === proposal.id
                              ? "Preparing..."
                              : "Prepare Contract"}
                          </button>
                        );
                      })()}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 pb-8">
                {Array.from(
                  { length: pagination.last_page },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchProposals(page)}
                    className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 
                      ${
                        pagination.current_page === page
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-110"
                          : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-indigo-600 hover:text-indigo-600"
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalModal;
