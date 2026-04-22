import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Contracts = () => {
  const { username } = useParams();

  const [contracts, setContracts] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get(`/api/freelancer/${username}/contracts`);
        setContracts(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchContracts();
  }, [username]);

  const fetchContracts = async () => {
    try {
      const res = await axios.get(`/api/freelancer/${username}/contracts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setContracts(res.data);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load contracts");
    }
  };

  const acceptContract = async (id) => {
    try {
      await axios.post(
        `/api/freelancer/${username}/contracts/${id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Contract accepted");

      fetchContracts();
    } catch (error) {
      console.log(error);

      toast.error("Failed to accept contract");
    }
  };

  const submitWork = async (id) => {
    const note = prompt("Enter submission note");

    if (!note) return;

    try {
      await axios.post(
        `/api/freelancer/${username}/contracts/${id}/submit-work`,
        { submission_note: note },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Work submitted successfully");

      fetchContracts();
    } catch (error) {
      console.log(error);
      toast.error("Submission failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-800/50 p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">My Contracts</h1>

        {contracts.length === 0 && (
          <p className="text-gray-500 dark:text-slate-400">No contracts yet.</p>
        )}

        <div className="space-y-6">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 border"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {contract.project_title}
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Client: {contract.client_name}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Contract #: {contract.contract_number}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-emerald-600">
                    ${contract.agreed_amount}
                  </p>

                  <p className="text-sm capitalize">{contract.status}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {contract.status === "pending" && (
                  <button
                    onClick={() => acceptContract(contract.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Accept Contract
                  </button>
                )}

                {contract.status === "active" && (
                  <button
                    onClick={() => submitWork(contract.id)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Submit Work
                  </button>
                )}

                {contract.status === "submitted" && (
                  <span className="text-yellow-600 font-medium">
                    Waiting for client approval
                  </span>
                )}

                {contract.status === "completed" && (
                  <span className="text-green-600 font-medium">Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contracts;
