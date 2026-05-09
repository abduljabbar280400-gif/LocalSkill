import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

import ContractDetailsComponent from "../../components/ContractDetails";

import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

export default function MyProjects() {
  const { username } = useParams();
  const location = useLocation();

  const [stats, setStats] = useState({
    proposal_count: 0,
    accepted_proposals: 0,
    active_contracts: 0,
    completed_contracts: 0,
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const [contractData, setContractData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);

  const modalRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showModal]);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const res = await api.get(`/freelancer/${username}/my-projects`);
      setStats({
        proposal_count: res.data.proposal_count,
        accepted_proposals: res.data.accepted_proposals,
        active_contracts: res.data.active_contracts,
        completed_contracts: res.data.completed_contracts,
      });
      const projectList = res.data.projects || [];
      setProjects(projectList);

      // ✅ CHECK FOR AUTO-OPEN CONTRACT
      const queryParams = new URLSearchParams(location.search);
      const previewContractId = queryParams.get("preview_contract");

      if (previewContractId) {
        // If contract exists in list, open it
        previewContract(previewContractId);
      }
    } catch (error) {
      console.error("Failed to fetch my projects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    let direction = "asc";
    if (sortField === field && sortDirection === "asc") direction = "desc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...projects].sort((a, b) => {
      if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
      if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setProjects(sorted);
  };

  const closeModal = () => setShowModal(false);

  const previewContract = async (contractId) => {
    try {
      const res = await api.get(
        `/freelancer/${username}/contracts/${contractId}`,
      );
      setContractData(res.data.contract);
      setSelectedContractId(contractId);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to load contract", err);
    }
  };

  const acceptContract = async () => {
    try {
      await api.post(
        `/freelancer/${username}/contracts/${selectedContractId}/accept`,
      );
      toast.success("Contract accepted");
      closeModal();
      fetchMyProjects();
    } catch (error) {
      console.error("Accept failed", error);
      toast.error(error.response?.data?.message || "Failed to accept contract");
    }
  };

  const submitWork = async (note) => {
    const trimmedNote = note.trim();
    if (!trimmedNote) {
      toast.error("Please enter a submission note.");
      return;
    }

    try {
      await api.post(
        `/freelancer/${username}/contracts/${selectedContractId}/submit-work`,
        {
          submission_note: trimmedNote,
        },
      );
      toast.success("Work submitted successfully.");
      closeModal();
      fetchMyProjects();
    } catch (error) {
      console.error("Submit work failed", error);
      toast.error(error.response?.data?.message || "Submit failed");
    }
  };

  if (loading) return <div className="flex justify-center mt-10"><div className="common-spinner"></div></div>;

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <FaSort className="inline ml-2 text-gray-400 transition-transform duration-200 group-hover:scale-110" />
      );
    }

    return sortDirection === "asc" ? (
      <FaSortUp className="inline ml-2 text-indigo-600 transition-all duration-200 transform scale-110" />
    ) : (
      <FaSortDown className="inline ml-2 text-indigo-600 transition-all duration-200 transform scale-110" />
    );
  };

  const capitalizeFirst = (value) => {
    if (!value) return "-";

    const text = String(value).replace(/_/g, " ");
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <div className="container">
      <h2 className="text-2xl font-semibold mb-4">My Projects</h2>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Proposals Sent", value: stats.proposal_count },
            { label: "Accepted Proposals", value: stats.accepted_proposals },
            { label: "Active Contracts", value: stats.active_contracts },
            { label: "Completed Contracts", value: stats.completed_contracts },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/30 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300"
            >
              <p className="text-gray-800 dark:text-slate-200 text-sm font-medium mb-2">
                {stat.label}
              </p>
              <p className="text-gray-900 dark:text-slate-100 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-panel backdrop-blur-xl bg-gradient-to-br from-white/60 via-blue-50/40 to-green-50/40 border border-white/30 dark:border-slate-700/30 shadow-xl rounded-2xl overflow-x-auto">
        <table className="table projects-table w-full text-sm backdrop-blur-md">
          <thead className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border-b border-white/30 dark:border-slate-700/30">
            <tr>
              <th
                onClick={() => handleSort("title")}
                className=" px-4 py-3 text-center font-semibold text-gray-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600"
              >
                Project {renderSortIcon("title")}
              </th>

              <th
                onClick={() => handleSort("client")}
                className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600"
              >
                Client {renderSortIcon("client")}
              </th>

              <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-slate-300">
                Budget
              </th>

              <th
                onClick={() => handleSort("proposal_status")}
                className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600"
              >
                Proposal Status {renderSortIcon("proposal_status")}
              </th>

              <th
                onClick={() => handleSort("contract_status")}
                className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600"
              >
                Contract Status {renderSortIcon("contract_status")}
              </th>

              <th
                onClick={() => handleSort("created_at")}
                className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600"
              >
                Created At {renderSortIcon("created_at")}
              </th>

              <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-slate-300">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {projects.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-slate-300" colSpan="7">
                  No projects found
                </td>
              </tr>
            )}

            {projects.map((project) => (
              <tr key={project.project_id} className="">
                <td className="px-4 py-3 text-center text-gray-700 dark:text-slate-300">
                  {project.title}
                </td>

                <td className="px-4 py-3 text-center text-gray-700 dark:text-slate-300">
                  {capitalizeFirst(project.client)}
                </td>

                <td className="px-4 py-3 text-gray-700 dark:text-slate-300 font-medium">
                  ₹{project.budget_min?.toLocaleString()} - ₹
                  {project.budget_max?.toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={
                      "chip " +
                      (project.proposal_status
                        ? `chip-status-${project.proposal_status}`
                        : "chip-status-default")
                    }
                  >
                    {capitalizeFirst(project.proposal_status || "Unknown")}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={
                      "chip " +
                      (project.contract_status
                        ? `chip-status-${project.contract_status}`
                        : "chip-status-default")
                    }
                  >
                    {capitalizeFirst(project.contract_status || "No Contract")}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                  {project.created_at
                    ? new Date(project.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </td>

                <td className="">
                  {project.contract_id && (
                    <button
                      onClick={() => previewContract(project.contract_id)}
                      className="text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full"
                    >
                      {project.contract_status === "active"
                        ? "Submit Work"
                        : "Preview Contract"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && contractData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-opacity duration-300">
          {/* Modal Container */}
          <div
            ref={modalRef}
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-xl"
          >
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <ContractDetailsComponent
                contract={contractData}
                role="freelancer"
                onAccept={acceptContract}
                onSubmitWork={submitWork}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="group absolute top-6 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border hover:bg-white dark:bg-slate-800 hover:scale-110 transition-all shadow-md"
            >
              <AiOutlineClose
                size={22}
                className="text-gray-700 dark:text-slate-300 group-hover:text-red-600 transition-colors"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
