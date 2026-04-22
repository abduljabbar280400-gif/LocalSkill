import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

import ContractDetailsComponent from "../../components/ContractDetails";

import ReviewModal from "../../components/reviews/ReviewModal";

export default function ContractDetails() {
  const { username, contractId } = useParams();
  const [contract, setContract] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await api.get(
          `/hire-freelancer/${username}/contracts/${contractId}`,
        );

        console.log("Contract response:", res.data);

        setContract(res.data.contract);
      } catch (error) {
        console.error("Fetch contract error:", error.response?.data);
      }
    };

    fetchContract();
  }, [username, contractId]);

  if (!contract)
    return (
      <div className="p-10 text-center text-gray-500 dark:text-slate-400"> Loading... </div>
    );

  const handleProjectCompleted = () => {
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    alert("Review submitted successfully");
  };

  if (!contract)
    return (
      <div className="p-10 text-center text-gray-500 dark:text-slate-400"> Loading... </div>
    );

  return (
    <>
      <ContractDetailsComponent
        contract={contract}
        role="client"
        onProjectCompleted={handleProjectCompleted}
      />
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        contractId={contract.id}
        username={username}
        onSuccess={handleReviewSuccess}
      />
    </>
  );
}
