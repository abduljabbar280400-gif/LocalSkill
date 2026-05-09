import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

function PrepareContract() {
  const { username, projectId, proposalId } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    contract_title: "",
    contract_description: "",
    contract_amount: "",
    start_date: "",
    end_date: "",
  });

  // ===============================
  // Fetch Proposal Details
  // ===============================
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        console.log("Params:", username, projectId, proposalId);

        if (!username || !projectId || !proposalId) {
          console.error("Missing params");
          return;
        }

        const res = await api.get(
          `/hire-freelancer/${username}/projects/${projectId}/proposals/${proposalId}`,
        );

        console.log("Proposal Response:", res.data);

        setProposal(res.data.proposal || res.data);

        setFormData((prev) => ({
          ...prev,
          contract_title: `Contract for ${res.data.project?.title || "Project"}`,
        }));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching proposal:", error);
        setLoading(false);
      }
    };

    fetchProposal();
  }, [username, projectId, proposalId]);

  // ===============================
  // Handle Input Change
  // ===============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ===============================
  // Submit Contract
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        proposal_id: proposalId,
        ...formData,
      };

      console.log("Submitting Contract:", payload);

      const res = await api.post(
        `/hire-freelancer/${username}/projects/${projectId}/contracts`,
        payload,
      );

      console.log("Contract Created:", res.data);

      const contractId = res.data.contract?.id;

      if (contractId) {
        navigate(`/hire-freelancer/${username}/contracts/${contractId}`);
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      setIsSubmitting(false);
    }
  };

  // ===============================
  // Loading State
  // ===============================
  if (loading) {
    return <div className="flex justify-center mt-10"><div className="common-spinner"></div></div>;
  }

  if (!proposal) {
    return <div>Proposal not found</div>;
  }

  return (
    <div>
      <h2>Prepare Contract</h2>

      <div>
        <h3>Freelancer Details</h3>

        <p>
          <strong>Name:</strong>{" "}
          {proposal.freelancer?.name || "Unknown Freelancer"}
        </p>

        <p>
          <strong>Proposal Amount:</strong> {proposal.proposed_amount}
        </p>

        <p>
          <strong>Estimated Duration:</strong> {proposal.estimated_duration}
        </p>
      </div>

      <hr />

      <form onSubmit={handleSubmit}>
        <div>
          <label>Contract Title</label>
          <input
            type="text"
            name="contract_title"
            value={formData.contract_title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Contract Description</label>
          <textarea
            name="contract_description"
            value={formData.contract_description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Contract Amount</label>
          <input
            type="number"
            name="contract_amount"
            value={formData.contract_amount}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Contract"}
        </button>
      </form>
    </div>
  );
}

export default PrepareContract;
