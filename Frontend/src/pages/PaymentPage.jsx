import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import { FiCreditCard, FiDollarSign, FiClock, FiCheckCircle, FiShield, FiAlertCircle } from "react-icons/fi";

export default function PaymentPage() {
  const { username, contractId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const fetchData = async () => {
    console.log("Fetching payments for:", { username, contractId });
    try {
      setLoading(true);
      setError(null);
      setDebug(null);
      const url = `/hire-freelancer/${username}/contracts/${contractId}/payments`;
      console.log("API URL:", url);
      const res = await api.get(url);
      console.log("API Result:", res.data);
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      if (err.response) {
        console.error("Response Data:", err.response.data);
        console.error("Response Status:", err.response.status);
        setDebug(err.response.data.debug);
      }
      setError(err.response?.data?.message || err.message || "Failed to load contract");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contractId, username]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) return toast.error("Please enter a valid amount");

    const agreed = parseFloat(data.agreed_amount);
    const paid = parseFloat(data.total_paid);
    const remaining = agreed - paid;

    if (paymentAmount > remaining) {
      return toast.error(`Amount exceeds remaining balance (₹${remaining})`);
    }

    try {
      setIsPaying(true);
      await api.post(`/hire-freelancer/${username}/contracts/${contractId}/payments`, {
        amount: paymentAmount,
        transaction_reference: "TXN" + Date.now(),
      });
      toast.success("Payment Successful! Funds are now in escrow.");
      setPaymentAmount("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 max-w-lg w-full">
        <FiAlertCircle className="mx-auto text-5xl text-red-500 mb-4" />
        <p className="text-xl font-bold dark:text-white mb-2">{error || "Contract not found"}</p>
        
        {debug && (
          <div className="mt-4 mb-6 p-4 bg-gray-100 dark:bg-slate-900 rounded-xl text-left text-xs font-mono overflow-auto">
            <p className="text-gray-400 mb-2 uppercase font-bold tracking-widest">Debug Info</p>
            <pre className="text-red-400">{JSON.stringify(debug, null, 2)}</pre>
          </div>
        )}

        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
          There was an issue retrieving the contract details. This usually happens if the contract ID is incorrect or if you don't have permission to view it.
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={fetchData}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
          >
            Try Again
          </button>
          <button 
            onClick={() => window.close()}
            className="w-full px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition"
          >
            Close Tab
          </button>
        </div>
      </div>
    </div>
  );

  const agreed = parseFloat(data.agreed_amount);
  const paid = parseFloat(data.total_paid);
  const remaining = Math.max(0, agreed - paid);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold flex items-center">
              <FiShield className="mr-3" /> Secure Escrow Payment
            </h1>
            <p className="mt-2 text-blue-100">Funding Contract: {data.contract_number}</p>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Left Column: Summary */}
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center dark:text-white">
                <FiDollarSign className="mr-2 text-green-500" /> Contract Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl">
                  <span className="text-gray-500">Agreed Amount</span>
                  <span className="font-bold dark:text-white">₹{agreed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl">
                  <span className="text-gray-500">Total Funded</span>
                  <span className="font-bold text-green-600">₹{paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <span className="text-blue-700 dark:text-blue-400 font-medium">Remaining to Fund</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400 text-xl">₹{remaining.toLocaleString()}</span>
                </div>
              </div>

              {/* History */}
              <div className="mt-10">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                  <FiClock className="mr-2" /> Recent Payments
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {data.payments?.map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-3 border-b dark:border-slate-700 last:border-0">
                      <div>
                        <p className="font-bold dark:text-white">₹{p.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{new Date(p.paid_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center">
                        <FiCheckCircle className="mr-1" /> Success
                      </span>
                    </div>
                  ))}
                  {(!data.payments || data.payments.length === 0) && (
                    <p className="text-sm text-gray-500 italic">No payments recorded yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="bg-gray-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-6 flex items-center dark:text-white">
                <FiCreditCard className="mr-2 text-blue-600" /> Fund Milestone
              </h2>
              
              <form onSubmit={handlePayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Payment Amount (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 italic">
                    Funds will be held in secure escrow and only released when you approve the work.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isPaying || remaining === 0}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                  {isPaying ? "Processing Securely..." : `Pay ₹${parseFloat(paymentAmount || 0).toLocaleString()}`}
                </button>
              </form>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-start">
                <FiShield className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  <strong>LocalSkill Protection:</strong> Your payment is 100% protected. We only release funds to the freelancer once you confirm the project deliverables.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} LocalSkill Escrow Services. All transactions are encrypted.</p>
        </div>
      </div>
    </div>
  );
}
