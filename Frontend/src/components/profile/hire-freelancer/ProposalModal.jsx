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

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ Prevent stale flash
      setProposals([]);

      const res = await api.get(
        `/hire-freelancer/${username}/projects/${projectId}/proposals`,
      );

      setProposals(res.data.proposals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId, username]);

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

  const filteredProposals =
    activeFilter === "all"
      ? proposals
      : proposals.filter((p) => p.status === activeFilter);

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
        onClick={() => updateStatus(proposal.id, value)}
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

  const updateStatus = async (proposalId, newStatus) => {
    try {
      setUpdatingStatusId(proposalId);
      await api.put(`/proposals/${proposalId}`, {
        status: newStatus,
      });

      // Update only local proposals
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: newStatus } : p,
        ),
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Proposals</h2>
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {filteredProposals.length} total
              </span>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalModal;
