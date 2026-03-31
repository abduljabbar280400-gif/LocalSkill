import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import ChatBox from "./ChatBox";

import { useNavigate } from "react-router-dom";

export default function ContractDetails({
  contract,
  role = "client",
  onAccept,
  onSubmitWork,
  onProjectCompleted,
}) {
  const [currentContract, setCurrentContract] = useState(contract);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [submissionNote, setSubmissionNote] = useState("");
  const [showChat, setShowChat] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editAmount, setEditAmount] = useState(contract.agreed_amount);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [payments, setPayments] = useState([]);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const storedUser = localStorage.getItem("client_user");
  const username = storedUser ? JSON.parse(storedUser).username : null;

  const navigate = useNavigate();

  const goToPayment = () => {
    navigate(`/hire-freelancer/${username}/contracts/${contract.id}/payment`);
  };

  // console.log("Here is the", username);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await api.get(
        `/hire-freelancer/${username}/contracts/${contract.id}/payments`,
      );

      setPayments(res.data.payments);

      setCurrentContract((prev) => ({
        ...prev,
        ...res.data,
      }));
    } catch (err) {
      console.error(err);
    }
  }, [username, contract.id]);

  useEffect(() => {
    if (showPaymentModal) {
      fetchPayments();
    }
  }, [showPaymentModal, fetchPayments]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!contract) return null;

  const agreed = parseFloat(currentContract.agreed_amount ?? 0);
  const paid = parseFloat(currentContract.total_paid ?? 0);

  const remainingAmount = Math.max(0, agreed - paid);

  // ============================
  // 🔥 UPDATE AGREED AMOUNT
  // ============================
  const handleUpdateAmount = async () => {
    try {
      await api.put(
        `/hire-freelancer/${username}/contracts/${contract.id}/amount`,
        {
          agreed_amount: editAmount,
        },
      );

      alert("Amount updated");
      setCurrentContract((prev) => ({
        ...prev,
        agreed_amount: editAmount,
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  // ============================
  // 💰 MAKE PAYMENT
  // ============================
  const handlePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      return alert("Enter valid amount");
    }

    if (paymentAmount > remainingAmount) {
      return alert("Amount exceeds remaining");
    }

    try {
      setLoadingPayment(true);

      const res = await api.post(
        `/hire-freelancer/${username}/contracts/${contract.id}/payments`,
        {
          amount: paymentAmount,
          transaction_reference: "TXN" + Date.now(),
        },
      );

      alert("Payment Success");

      setPaymentAmount("");
      setCurrentContract(res.data.contract);
      await fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed");
    } finally {
      setLoadingPayment(false);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    active: "bg-blue-100 text-blue-700",
    submitted: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
  };

  const handleCompleteProject = async () => {
    const confirmAction = window.confirm(
      "Are you sure you want to mark this project as completed?",
    );
    if (!confirmAction) return;

    try {
      setUpdatingStatus(true);
      await api.post(
        `/hire-freelancer/${currentContract.client_id}/contracts/${currentContract.id}/complete`,
      );

      const updatedContractRes = await api.get(
        `/hire-freelancer/${currentContract.client_id}/contracts/${currentContract.id}`,
      );

      setCurrentContract(updatedContractRes.data.contract);
      alert("Project completed successfully.");
      if (onProjectCompleted) onProjectCompleted();
    } catch (error) {
      console.error("Complete project error:", error.response?.data);
      alert("Error completing project. Try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReworkProject = async () => {
    const confirmAction = window.confirm(
      "Are you sure you want to send this project back for re-work?",
    );
    if (!confirmAction) return;

    try {
      setUpdatingStatus(true);
      await api.put(
        `/hire-freelancer/${currentContract.client_id}/contracts/${currentContract.id}/rework`,
      );

      const updatedContractRes = await api.get(
        `/hire-freelancer/${currentContract.client_id}/contracts/${currentContract.id}`,
      );
      setCurrentContract(updatedContractRes.data.contract);
      alert("Project sent for re-work.");
    } catch (error) {
      console.error("Rework project error:", error.response?.data);
      alert("Error sending project for re-work. Try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmitWork = async () => {
    const trimmedNote = submissionNote.trim();
    if (!trimmedNote) {
      alert("Please enter a submission note.");
      return;
    }

    if (onSubmitWork) {
      await onSubmitWork(trimmedNote);
      setSubmissionNote("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto border border-gray-200 p-8 m-5 overflow-y-auto bg-white rounded-xl shadow-2xl transform transition-all duration-300 scale-100 animate-[fadeIn_.25s_ease]">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contract Details</h1>

        <span
          className={`px-3 py-1 text-sm rounded-full font-medium capitalize ${
            statusColors[currentContract.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {currentContract.status}
        </span>
      </div>

      {/* Contract Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[
          ["Contract Number", contract.contract_number],
          ["Project Title", contract.project_title],
          ["Client Name", contract.client_name],
          ["Freelancer Name", contract.freelancer_name],
          ["Agreed Amount", `₹ ${contract.agreed_amount}`],
          ["Proposal Duration", contract.proposal_duration],
          ["Start Date", formatDate(contract.start_date)],
          ["End Date", formatDate(contract.end_date)],
          ["Created At", formatDate(contract.created_at)],
          ["Updated At", formatDate(contract.updated_at)],
        ].map(([label, value], idx) => (
          <div
            key={idx}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-gray-900 font-semibold mt-1 capitalize">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* 💰 PAYMENT SECTION */}
      {/* ========================= */}
      {role === "client" && currentContract.status === "active" && (
        <div className="mt-8 p-5 border rounded-xl bg-gray-50">
          <h2 className="font-bold mb-3">Payment</h2>

          <p>Total Paid: ₹{currentContract.total_paid || 0}</p>
          <p>Remaining: ₹{remainingAmount}</p>
          <p>Status: {currentContract.payment_status || "pending"}</p>

          <button
            onClick={() => setShowPaymentModal(true)}
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg"
          >
            Pay Now
          </button>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Payment</h2>

            {/* Edit Amount */}
            <div className="mb-4">
              <label className="text-sm">Agreed Amount</label>
              <input
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
              <button
                onClick={handleUpdateAmount}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>

            {/* Payment Input */}
            <div className="mb-4">
              <label>Pay Amount</label>
              <input
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>

            <button
              onClick={handlePayment}
              disabled={loadingPayment}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              {loadingPayment ? "Processing..." : "Pay"}
            </button>

            {/* Payment History */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">History</h3>

              {payments.map((p) => (
                <div key={p.id} className="border-b py-2 flex justify-between">
                  <span>₹{p.amount}</span>
                  <span>{formatDate(p.paid_at)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="mt-4 text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Freelancer Actions */}
      <div className="mt-10 space-y-4">
        {role === "freelancer" && contract.status === "pending" && (
          <button
            onClick={onAccept}
            className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
          >
            Accept Contract
          </button>
        )}

        {role === "freelancer" && contract.status === "active" && (
          <div className="space-y-3">
            <textarea
              value={submissionNote}
              onChange={(e) => setSubmissionNote(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter submission note..."
            />

            <button
              onClick={handleSubmitWork}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Submit Work
            </button>
          </div>
        )}
      </div>

      {/* Freelancer Submission Note */}
      {role === "client" && currentContract.submission_note && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h2 className="font-semibold text-blue-800 mb-2">
            Freelancer Submission Note
          </h2>
          <p className="text-gray-700 italic">
            "{currentContract.submission_note}"
          </p>
        </div>
      )}

      {/* Client Actions */}
      {role === "client" && currentContract.status === "submitted" && (
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={handleCompleteProject}
            disabled={updatingStatus}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
          >
            {updatingStatus ? "Processing..." : "Complete Project"}
          </button>

          <button
            onClick={handleReworkProject}
            disabled={updatingStatus}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition"
          >
            {updatingStatus ? "Processing..." : "Re-Work"}
          </button>
        </div>
      )}

      <button
        onClick={goToPayment}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Go to Payment
      </button>

      {/* Chat Section */}
      <div className="mt-12 border-t pt-6">
        {/* Chat Toggle Button */}
        <div
          className={`mb-4 overflow-hidden transition-all duration-500 ${
            showChat ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {showChat && <ChatBox contractId={contract.id} />}
        </div>

        <button
          onClick={() => setShowChat(!showChat)}
          className="px-4 py-2 w-full  bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          {showChat ? "Hide Chat" : "Open Chat"}
        </button>

        {/* ChatBox (only shows when showChat is true) */}
      </div>
    </div>
  );
}
