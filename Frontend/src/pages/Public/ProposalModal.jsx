import { useState } from "react";
import api from "../services/api";

export default function ProposalModal({ projectId, onClose }) {
  const [form, setForm] = useState({
    cover_letter: "",
    proposed_amount: "",
    estimated_duration: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/projects/${projectId}/proposals`, form);

      alert("Proposal has been submitted");
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Error submitting proposal");
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Cover Letter"
          value={form.cover_letter}
          onChange={(e) => setForm({ ...form, cover_letter: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Proposed Amount ena nu terila"
          value={form.proposed_amount}
          onChange={(e) =>
            setForm({ ...form, proposed_amount: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Estimated Duration"
          value={form.estimated_duration}
          onChange={(e) =>
            setForm({ ...form, estimated_duration: e.target.value })
          }
        />
        <button type="submit">Submit Proposal</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}
