import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { FiDollarSign, FiClock, FiCheckCircle, FiTrendingUp, FiArrowUpRight, FiPieChart } from "react-icons/fi";

export default function Earnings() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/freelancer/${username}/earnings`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Financial Overview</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Manage your earnings and escrowed funds</p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl text-green-600">
              <FiTrendingUp size={24} />
            </div>
            <div className="pr-4">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Global Status</p>
              <p className="text-sm font-bold text-green-600">Account Active</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-xl shadow-green-500/20 relative overflow-hidden group">
            <FiDollarSign className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 group-hover:scale-110 transition-transform" />
            <p className="text-green-100 font-bold uppercase tracking-widest text-xs mb-2">Total Released</p>
            <h2 className="text-4xl font-black mb-6">₹{parseFloat(data.total_earned || 0).toLocaleString()}</h2>
            <div className="flex items-center text-sm bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 w-fit">
              <FiArrowUpRight className="mr-2" /> <span>Available for withdrawal</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-blue-500/5 border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
            <FiPieChart className="absolute -right-4 -bottom-4 text-blue-500/5 w-32 h-32 group-hover:scale-110 transition-transform" />
            <p className="text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Pending in Escrow</p>
            <h2 className="text-4xl font-black mb-6 text-gray-900 dark:text-white">₹{parseFloat(data.pending_escrow || 0).toLocaleString()}</h2>
            <div className="flex items-center text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-2 w-fit font-bold">
              <FiClock className="mr-2" /> <span>Awaiting project completion</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-purple-500/5 border border-gray-100 dark:border-slate-700 flex flex-col justify-center">
            <p className="text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">Payout Method</p>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Direct Bank Transfer</span>
              <button className="text-xs text-blue-600 font-bold hover:underline">Edit</button>
            </div>
            <button className="w-full mt-4 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-black transition-all">
              Withdraw Funds
            </button>
          </div>

        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-gray-500/5 border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <FiClock className="mr-2 text-blue-600" /> Payment History
            </h3>
            <button className="text-sm text-blue-600 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-xl transition-all">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                  <th className="px-8 py-4">Transaction ID</th>
                  <th className="px-8 py-4">Contract</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Earnings</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {data.recent_payments?.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-medium text-gray-600 dark:text-slate-400">
                      {p.transaction_reference}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-900 dark:text-white">
                      {p.contract?.project_title || "Freelance Project"}
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-green-600">
                      ₹{p.freelancer_earnings.toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${
                        p.freelancer_payout_status === 'released' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.freelancer_payout_status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500">
                      {new Date(p.paid_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!data.recent_payments || data.recent_payments.length === 0) && (
              <div className="p-20 text-center">
                <FiDollarSign className="mx-auto text-4xl text-gray-200 mb-4" />
                <p className="text-gray-500 italic">No transactions found.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
