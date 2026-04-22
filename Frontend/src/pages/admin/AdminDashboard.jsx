import { useEffect, useState } from "react";
import api from "../../services/api";
import { FaUsers, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/control-center/internal/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/control-center/internal/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const freelancers = users.filter((u) => u.role === "freelancer");
  const clients = users.filter((u) => u.role === "client");

  const handleLogout = async () => {
    try {
      await api.post("/control-center/internal/logout"); // if exists
    } catch (err) {
      console.warn("Logout API failed (safe to ignore)", err);
    } finally {
      // clear admin data
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");

      // redirect to login
      navigate("/cc/inter/admin/login");
    }
  };

  if (loading || !stats) {
    return <div className="p-10 text-center"> Loading... </div>;
  }

  return (
    <div className="p-8 bg-gray-100 dark:bg-slate-800 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition my-6"
        >
          Logout
        </button>
      </div>

      {/* ================= OVERVIEW ================= */}
      {view === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {/* TOTAL USERS */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
            <div className="flex items-center gap-3 mb-3">
              <FaUsers className="text-indigo-500 text-xl" />
              <h2 className="font-semibold text-lg">Total Users</h2>
            </div>

            <p className="text-3xl font-bold mb-3">{stats.users.total}</p>

            <div className="flex justify-between text-sm">
              <button
                onClick={() => setView("freelancers")}
                className="text-green-600 hover:underline"
              >
                Freelancers ({stats.users.freelancers})
              </button>

              <button
                onClick={() => setView("clients")}
                className="text-blue-600 hover:underline"
              >
                Clients ({stats.users.clients})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FREELANCERS TABLE ================= */}
      {view === "freelancers" && (
        <Table
          title="Freelancers"
          data={freelancers}
          onBack={() => setView("overview")}
          type="freelancer"
        />
      )}

      {/* ================= CLIENTS TABLE ================= */}
      {view === "clients" && (
        <Table
          title="Clients"
          data={clients}
          onBack={() => setView("overview")}
        />
      )}
    </div>
  );
}

/* ================= TABLE COMPONENT ================= */

function Table({ title, data, onBack, type }) {
  const [rows, setRows] = useState(data);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const approveFreelancer = async (id) => {
    try {
      setApprovingId(id); // start loading

      await api.patch(`/control-center/internal/freelancers/${id}/approve`);

      // update UI instantly
      setRows((prev) =>
        prev.map((item) =>
          item.freelancer_profile?.id === id
            ? {
                ...item,
                freelancer_profile: {
                  ...item.freelancer_profile,
                  profile_approved: true,
                },
              }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null); // stop loading
    }
  };

  const rejectFreelancer = async (id) => {
    try {
      setRejectingId(id);

      await api.patch(`/control-center/internal/freelancers/${id}/reject`);

      setRows((prev) =>
        prev.map((item) =>
          item.freelancer_profile?.id === id
            ? {
                ...item,
                freelancer_profile: {
                  ...item.freelancer_profile,
                  profile_approved: false,
                },
              }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>

        <button
          onClick={onBack}
          className="text-sm text-gray-500 dark:text-slate-400 hover:underline"
        >
          ← Back
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-600 dark:text-slate-400 text-sm">
              <th className="py-2">Username</th>
              <th>Email</th>

              {type === "freelancer" && <th>Approval</th>}

              <th>Status</th>
              <th>Joined</th>

              {type === "freelancer" && <th>Action</th>}
              {type === "freelancer" && <th>Profile</th>}
            </tr>
          </thead>

          <tbody>
            {rows.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50 dark:bg-slate-800/50">
                <td className="py-3 font-medium">
                  {user.user?.username || user.username}
                </td>

                <td>{user.user?.email || user.email}</td>

                {/* APPROVAL STATUS */}
                {type === "freelancer" && (
                  <td>
                    {user.freelancer_profile?.profile_approved ? (
                      <span className="text-green-600 text-sm font-medium">
                        Approved
                      </span>
                    ) : (
                      <span className="text-yellow-500 text-sm font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                )}

                {/* ACTIVE / SUSPENDED */}
                <td>
                  {(user.user?.is_suspended ?? user.is_suspended) ? (
                    <span className="text-red-500 text-sm">Suspended</span>
                  ) : (
                    <span className="text-green-500 text-sm">Active</span>
                  )}
                </td>

                <td className="text-sm text-gray-500 dark:text-slate-400">
                  {new Date(
                    user.user?.created_at || user.created_at,
                  ).toLocaleDateString()}
                </td>

                {/* APPROVE BUTTON */}
                <td className="flex gap-2">
                  {/* APPROVE */}
                  {!user.freelancer_profile?.profile_approved && (
                    <button
                      onClick={() =>
                        approveFreelancer(user.freelancer_profile?.id)
                      }
                      disabled={approvingId === user.freelancer_profile?.id}
                      className={`px-3 py-1 rounded-lg text-sm flex items-center gap-2
        ${
          approvingId === user.freelancer_profile?.id
            ? "bg-gray-400"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
                    >
                      {approvingId === user.freelancer_profile?.id ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        "Approve"
                      )}
                    </button>
                  )}

                  {/* REJECT */}
                  <button
                    onClick={() =>
                      rejectFreelancer(user.freelancer_profile?.id)
                    }
                    disabled={rejectingId === user.freelancer_profile?.id}
                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-2
      ${
        rejectingId === user.freelancer_profile?.id
          ? "bg-gray-400"
          : "bg-red-500 hover:bg-red-600 text-white"
      }`}
                  >
                    {rejectingId === user.freelancer_profile?.id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Reject"
                    )}
                  </button>
                </td>

                {type === "freelancer" && (
                  <td>
                    <a
                      href={`/freelancer/${user.user?.username || user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      <FaEye />
                      View
                    </a>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
