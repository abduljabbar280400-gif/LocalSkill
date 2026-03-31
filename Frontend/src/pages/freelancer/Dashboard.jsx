import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function FreelancerDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { username } = useParams();

  // 🔥 NEW STATES
  const [earnings, setEarnings] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [recentPayments, setRecentPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("monthly");

  useEffect(() => {
    if (!user?.username) return;

    const fetchDashboard = async () => {
      try {
        const response = await api.get(
          `/freelancer/${user.username}/dashboard`,
        );
        setStats(response.data.stats);
      } catch (err) {
        setError("Unable to load dashboard data");
        console.error(err);
      }
    };

    const fetchEarnings = async () => {
      try {
        const res = await api.get(`/freelancer/${user.username}/earnings`);
        setEarnings(res.data.summary);
        setRecentPayments(res.data.recent_payments);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchMonthly = async () => {
      try {
        const res = await api.get(
          `/freelancer/${user.username}/earnings/monthly?year=${year}`,
        );
        setMonthlyData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchWeekly = async () => {
      try {
        const res = await api.get(
          `/freelancer/${user.username}/earnings/weekly?year=${year}`,
        );
        setWeeklyData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    Promise.all([
      fetchDashboard(),
      fetchEarnings(),
      fetchMonthly(),
      fetchWeekly(),
    ]).finally(() => setLoading(false));
  }, [user, year]);

  if (!user) return null;

  if (user && user.username !== username) {
    return <Navigate to={`/freelancer/${user.username}/dashboard`} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4 lg:px-8">
      <section>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* HEADER */}
          <header className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800">
                Welcome,{" "}
                <strong className="text-gray-900">{user.first_name}</strong>
              </h1>
            </div>

            {/* EXISTING SECTION (UNCHANGED LOGIC) */}
            {!stats ? (
              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                <h2 className="font-semibold text-gray-800 text-lg">
                  Complete your profile
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Once you complete your freelancer profile and start working
                  with clients, we will show your ratings, completed jobs and
                  more here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                    <h2 className="font-semibold text-gray-800 mb-5 text-lg">
                      Performance
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
                        <div className="text-xs text-gray-500">
                          Average Rating
                        </div>
                        <div className="text-lg font-semibold text-gray-800 mt-1">
                          {stats.average_rating}
                        </div>
                      </div>

                      <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
                        <div className="text-xs text-gray-500">
                          Total Reviews
                        </div>
                        <div className="text-lg font-semibold text-gray-800 mt-1">
                          {stats.total_reviews}
                        </div>
                      </div>

                      <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
                        <div className="text-xs text-gray-500">
                          Completed Jobs
                        </div>
                        <div className="text-lg font-semibold text-gray-800 mt-1">
                          {stats.completed_jobs}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-800 text-lg">
                      Next steps
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      Keep your profile updated and respond quickly.
                    </p>
                  </div>

                  <button
                    className="mt-6 border bg-red-500 text-white border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </aside>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Track your earnings, performance and growth in one place.
            </p>
          </header>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* 🔥 EARNINGS SECTION */}
          {earnings && (
            <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-6 space-y-6">
              {/* CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
                  <p className="text-xs text-gray-500">Total Earnings</p>
                  <h2 className="text-lg font-semibold mt-1">
                    ₹{earnings.total_earnings}
                  </h2>
                </div>

                <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
                  <p className="text-xs text-gray-500">Net Paid</p>
                  <h2 className="text-lg font-semibold mt-1">
                    ₹{earnings.total_paid}
                  </h2>
                </div>

                <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
                  <p className="text-xs text-gray-500">Pending Payments</p>
                  <h2 className="text-lg font-semibold mt-1">
                    ₹{earnings.pending_earnings}
                  </h2>
                </div>

                <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
                  <p className="text-xs text-gray-500">Platform Fee</p>
                  <h2 className="text-lg font-semibold mt-1">
                    ₹{earnings.total_platform_fee}
                  </h2>
                </div>

                <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
                  <p className="text-xs text-gray-500">Total Contracts</p>
                  <h2 className="text-lg font-semibold mt-1">
                    {earnings.total_contracts}
                  </h2>
                </div>
              </div>

              {/* YEAR FILTER */}
              <div className="flex justify-end">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              {/* TABS */}
              <div className="flex gap-2 border-b border-gray-200 pb-2">
                <button
                  onClick={() => setActiveTab("monthly")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "monthly"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Monthly
                </button>

                <button
                  onClick={() => setActiveTab("weekly")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "weekly"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Weekly
                </button>
              </div>

              {/* CHART */}
              <div>
                {activeTab === "monthly" && (
                  <>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Monthly Earnings
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="earnings" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}

                {activeTab === "weekly" && (
                  <>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Weekly Earnings
                    </h3>

                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weeklyData}>
                        <XAxis dataKey="week" hide />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="earnings"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>
            </div>
          )}

          {/* RECENT PAYMENTS */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Payments
              </h3>
            </div>

            {recentPayments.length === 0 ? (
              <p className="text-gray-500 text-sm p-6">No payments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">No</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Earnings</th>
                      <th className="px-4 py-3 text-left">Fee</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentPayments.map((p, index) => (
                      <tr
                        key={p.id}
                        className="border-b last:border-0 even:bg-gray-50 hover:bg-gray-100 transition duration-200"
                      >
                        {/* ORDER NUMBER */}
                        <td className="px-4 py-4 text-gray-500 font-medium">
                          {index + 1}
                        </td>

                        {/* AMOUNT */}
                        <td className="px-4 py-4 font-semibold text-gray-800">
                          ₹{p.amount}
                        </td>

                        {/* EARNINGS */}
                        <td className="px-4 py-4 font-semibold text-green-600">
                          ₹{p.earnings}
                        </td>

                        {/* PLATFORM FEE */}
                        <td className="px-4 py-4 font-medium text-red-500">
                          ₹{p.platform_fee}
                        </td>

                        {/* STATUS WITH ICON */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              p.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {/* CAPITALIZED TEXT */}
                            {p.status.charAt(0).toUpperCase() +
                              p.status.slice(1)}
                          </span>
                        </td>

                        {/* DATE */}
                        <td className="px-4 py-4 text-gray-500 text-sm">
                          {new Date(p.paid_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
