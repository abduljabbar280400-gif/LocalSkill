import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";

export default function FreelancerDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { username } = useParams();

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

    Promise.all([fetchDashboard()]).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  if (user && user.username !== username) {
    return <Navigate to={`/freelancer/${user.username}/dashboard`} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-800/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-gray-300 dark:border-slate-600 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-slate-400 text-sm"> Loading... </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-800/50 py-6 px-4 lg:px-8">
      <section>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* HEADER */}
          <header className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-slate-200">
                Welcome,{" "}
                <strong className="text-gray-900 dark:text-slate-100">{user.first_name}</strong>
              </h1>
            </div>

            {/* EXISTING SECTION (UNCHANGED LOGIC) */}
            {!stats ? (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-lg">
                  Complete your profile
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Once you complete your freelancer profile and start working
                  with clients, we will show your ratings, completed jobs and
                  more here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                    <h2 className="font-semibold text-gray-800 dark:text-slate-200 mb-5 text-lg">
                      Performance
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="border rounded-xl p-4 hover:bg-gray-50 dark:bg-slate-800/50 transition">
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          Average Rating
                        </div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-slate-200 mt-1">
                          {stats.average_rating}
                        </div>
                      </div>

                      <div className="border rounded-xl p-4 hover:bg-gray-50 dark:bg-slate-800/50 transition">
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          Total Reviews
                        </div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-slate-200 mt-1">
                          {stats.total_reviews}
                        </div>
                      </div>

                      <div className="border rounded-xl p-4 hover:bg-gray-50 dark:bg-slate-800/50 transition">
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          Completed Jobs
                        </div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-slate-200 mt-1">
                          {stats.completed_jobs}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-800 dark:text-slate-200 text-lg">
                      Next steps
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Keep your profile updated and respond quickly.
                    </p>
                  </div>

                  <button
                    className="mt-6 border bg-red-500 text-white border-gray-300 dark:border-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </aside>
              </div>
            )}

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Track your earnings, performance and growth in one place.
            </p>
          </header>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* RECENT PAYMENTS */}
        </div>
      </section>
    </main>
  );
}
