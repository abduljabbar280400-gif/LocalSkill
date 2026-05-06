import { useEffect, useState } from "react";
import api from "../../services/api";
import { 
  FiUsers, 
  FiEye, 
  FiLayout, 
  FiUserCheck, 
  FiUserX, 
  FiLogOut, 
  FiSearch, 
  FiBell, 
  FiSettings, 
  FiBriefcase,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiMenu,
  FiX
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useTheme } from "../../context/useTheme";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const { isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [view, setView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [growthRange, setGrowthRange] = useState("6m");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats(growthRange);
  }, [growthRange]);

  const fetchStats = async (range = "6m") => {
    try {
      const res = await api.get(`/control-center/internal/dashboard?range=${range}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load platform statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/control-center/internal/logout");
    } catch (err) {
      console.warn("Logout API failed", err);
    } finally {
      localStorage.removeItem("admin_user");
      toast.info("Session terminated securely");
      navigate("/cc/inter/admin/login");
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing Terminal...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Dashboard", icon: FiLayout },
    { id: "freelancers", label: "Freelancers", icon: FiUserCheck },
    { id: "clients", label: "Clients", icon: FiUsers },
    { id: "projects", label: "Projects", icon: FiBriefcase },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      
      {/* --- SIDEBAR --- */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-colors duration-300 overflow-hidden"
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/50 mb-6">
          <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <FiLayout className="text-white" size={20} />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">Admin<span className="text-indigo-600">HQ</span></span>
          )}
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                view === item.id 
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <item.icon size={20} className={view === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 w-full px-4 space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-amber-900/10 transition-colors group"
          >
            {isDark ? <RiSunFill size={20} /> : <RiMoonFill size={20} />}
            {sidebarOpen && <span className="font-semibold">{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span className="font-semibold">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-[80px]"}`}>
        
        {/* TOP BAR */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <div className="relative hidden md:block">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
              <FiBell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-800 mx-2"></div>
            <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Admin Master</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Root Authority</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">AM</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* OVERVIEW VIEW */}
            {view === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
                  <p className="text-slate-500">Real-time health and performance metrics</p>
                </div>

                {/* STAT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Total Platform Users" value={stats.users.total} icon={FiUsers} trend="+12%" color="blue" />
                  
                  <StatCard 
                    label="Freelancers" 
                    value={stats.users.freelancers.total} 
                    icon={FiUserCheck} 
                    trend="+8%" 
                    color="emerald" 
                    breakdown={[
                      { label: "Daily Active", value: stats.users.freelancers.active, color: "text-emerald-500" },
                      { label: "Inactive (3d+)", value: stats.users.freelancers.inactive, color: "text-amber-500" },
                      { label: "Terminated", value: stats.users.freelancers.deleted, color: "text-red-500" }
                    ]}
                  />

                  <StatCard 
                    label="Clients" 
                    value={stats.users.clients.total} 
                    icon={FiUsers} 
                    trend="+5%" 
                    color="violet" 
                    breakdown={[
                      { label: "Daily Active", value: stats.users.clients.active, color: "text-indigo-500" },
                      { label: "Inactive (3d+)", value: stats.users.clients.inactive, color: "text-amber-500" },
                      { label: "Terminated", value: stats.users.clients.deleted, color: "text-red-500" }
                    ]}
                  />
                </div>

                {/* GROWTH GRAPH */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Growth</h2>
                      <p className="text-slate-500 text-sm">User registration trends analysis</p>
                    </div>
                    
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {[
                        { id: "1y", label: "1Y" },
                        { id: "6m", label: "6M" },
                        { id: "3m", label: "3M" },
                        { id: "1m", label: "1M" },
                        { id: "1w", label: "1W" }
                      ].map((range) => (
                        <button
                          key={range.id}
                          onClick={() => setGrowthRange(range.id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            growthRange === range.id 
                              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.growth}>
                        <defs>
                          <linearGradient id="colorFreelancers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: isDark ? "#64748b" : "#94a3b8", fontSize: 10, fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: isDark ? "#64748b" : "#94a3b8", fontSize: 10, fontWeight: 500 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isDark ? "#0f172a" : "#ffffff", 
                            borderColor: isDark ? "#1e293b" : "#e2e8f0",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: "600",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            padding: "12px"
                          }}
                          itemStyle={{ padding: "2px 0" }}
                        />
                        <Legend 
                          verticalAlign="top" 
                          align="right" 
                          height={36} 
                          iconType="circle"
                          formatter={(value) => <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{value}</span>}
                        />
                        <Area 
                          name="Freelancers"
                          type="monotone" 
                          dataKey="freelancers" 
                          stroke="#4f46e5" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorFreelancers)" 
                        />
                        <Area 
                          name="Clients"
                          type="monotone" 
                          dataKey="clients" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorClients)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FREELANCERS VIEW */}
            {view === "freelancers" && (
              <motion.div 
                key="freelancers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <DataTable 
                  title="Freelancer Management" 
                  description="Review and approve talent profiles"
                  type="freelancer" 
                />
              </motion.div>
            )}

            {/* CLIENTS VIEW */}
            {view === "clients" && (
              <motion.div 
                key="clients"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <DataTable 
                  title="Client Directory" 
                  description="Manage hiring entities and platform access"
                  type="client" 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function StatCard({ label, value, icon: Icon, trend, color, breakdown = [] }) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">{trend}</span>
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</p>
      
      {breakdown.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 space-y-2">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-400">{item.label}</span>
              <span className={item.color}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DataTable({ title, description, type }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingId, setLoadingId] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const navigate = useNavigate();

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNum) => {
    try {
      setIsDataLoading(true);
      const res = await api.get(`/control-center/internal/users`, {
        params: {
          role: type,
          search: searchTerm,
          status: filterStatus,
          page: pageNum
        }
      });
      setRows(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
        from: res.data.from,
        to: res.data.to
      });
      setPage(res.data.current_page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch records");
    } finally {
      setIsDataLoading(false);
    }
  };

  const getInactivityInfo = (lastSeen) => {
    if (!lastSeen) return { text: "N/A", color: "text-slate-400", diff: 999 };
    const last = new Date(lastSeen);
    const now = new Date();
    const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    
    if (diff <= 0) return { text: "Active Today", color: "text-emerald-500", diff: 0 };
    if (diff >= 30) return { text: `${diff}d Inactive`, color: "text-rose-600", diff };
    if (diff >= 14) return { text: `${diff}d Inactive`, color: "text-orange-500", diff };
    if (diff >= 7) return { text: `${diff}d Inactive`, color: "text-amber-500", diff };
    
    return { text: `${diff}d Inactive`, color: "text-slate-600", diff };
  };

  const handleStatusChange = async (id, action) => {
    try {
      setLoadingId(id);
      await api.patch(`/control-center/internal/freelancers/${id}/${action}`);
      
      setRows((prev) =>
        prev.map((item) =>
          item.freelancer_profile?.id === id
            ? {
                ...item,
                freelancer_profile: {
                  ...item.freelancer_profile,
                  profile_approved: action === "approve",
                },
              }
            : item,
        ),
      );
      toast.success(`Profile ${action}d successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      setLoadingId(null);
    }
  };

  const confirmSuspension = async () => {
    if (!suspendReason.trim()) return toast.warning("Reason is required");
    
    try {
      setLoadingId(targetUser.id);
      await api.patch(`/control-center/internal/users/${targetUser.id}/suspend`, { reason: suspendReason });
      
      setRows((prev) =>
        prev.map((u) => 
          u.id === targetUser.id 
            ? { 
                ...u, 
                is_suspended: true, 
                suspended_reason: suspendReason, 
                user: { ...u.user, is_suspended: true, suspended_reason: suspendReason },
                freelancer_profile: u.freelancer_profile ? { ...u.freelancer_profile, profile_visibility: 'hidden' } : null
              }
            : u
        )
      );
      
      toast.error(`Access restricted for ${targetUser.username}`);
      setShowSuspendModal(false);
      setSuspendReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Suspension failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      setLoadingId(userId);
      await api.patch(`/control-center/internal/users/${userId}/unsuspend`);
      
      setRows((prev) =>
        prev.map((u) => 
          u.id === userId 
            ? { ...u, is_suspended: false, suspended_reason: null, user: { ...u.user, is_suspended: false, suspended_reason: null } }
            : u
        )
      );
      
      toast.success("Account restriction removed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnverify = async (user) => {
    if (!window.confirm(`Are you sure you want to unverify ${user.first_name || user.user?.first_name || 'this user'}? This will remove their verified status from their profile.`)) return;

    try {
      setLoadingId(user.id);
      const profileId = user.freelancer_profile?.id || user.id; 
      
      await api.patch(`/control-center/internal/freelancers/${profileId}/unverify`);
      toast.success("Freelancer unverified successfully");
      
      setRows((prev) =>
        prev.map((u) => 
          (u.id === user.id) 
            ? { 
                ...u, 
                freelancer_profile: u.freelancer_profile ? { ...u.freelancer_profile, profile_approved: false, profile_approved_at: null } : null
              } 
            : u
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to unverify freelancer");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden transition-colors duration-300">
      {/* SUSPEND MODAL */}
      <AnimatePresence>
        {showSuspendModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setShowSuspendModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Restrict Account Access</h3>
              <p className="text-slate-500 text-sm mb-6">Please provide a formal reason for suspending <b>{targetUser?.username}</b>.</p>
              
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 min-h-[120px] dark:text-white"
                placeholder="Violation of terms, suspicious activity, etc..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
              
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowSuspendModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmSuspension}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                >
                  Confirm Restriction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-slate-500 text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 pl-4 pr-10 text-xs focus:ring-1 focus:ring-indigo-500 transition-all dark:text-white cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          >
            <option value="all">All Accounts</option>
            {type === "freelancer" && <option value="verified">Verified Only</option>}
            <option value="suspended">Suspended Only</option>
            <option value="active">Active Today</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search User Code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-xs w-full md:w-64 focus:ring-1 focus:ring-indigo-500 transition-all dark:text-white font-mono"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-4">User Identity</th>
              <th className="px-6 py-4">Security Level</th>
              {type === "freelancer" && <th className="px-6 py-4">Visibility</th>}
              <th className="px-6 py-4">Access Status</th>
              <th className="px-6 py-4">Active Status</th>
              {type === "freelancer" && <th className="px-6 py-4">Suspension Reason</th>}
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800 relative">
            {isDataLoading && (
              <tr className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <td colSpan="100%" className="h-32 flex items-center justify-center w-full">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </td>
              </tr>
            )}
            {rows.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 shrink-0">
                      {(user.first_name || user.user?.first_name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user.user?.title || user.title}{" "}
                        {user.user?.first_name || user.first_name}{" "}
                        {user.user?.last_name || user.last_name}
                      </p>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5 tracking-wider font-mono">
                        {user.user?.public_user_code || user.public_user_code}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                        {user.user?.email || user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  {type === "freelancer" ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.freelancer_profile?.profile_approved 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" 
                        : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                    }`}>
                      {user.freelancer_profile?.profile_approved ? <FiCheckCircle size={10} /> : <FiAlertCircle size={10} />}
                      {user.freelancer_profile?.profile_approved ? "Verified" : "Pending Approval"}
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                      Tier 1 Client
                    </span>
                  )}
                </td>
                
                {type === "freelancer" && (
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                      user.freelancer_profile?.profile_visibility === "public"
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}>
                      {user.freelancer_profile?.profile_visibility || "unknown"}
                    </span>
                  </td>
                )}

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.user?.is_suspended || user.is_suspended ? "bg-red-500" : "bg-green-500"} shadow-[0_0_8px_rgba(34,197,94,0.4)]`}></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {user.user?.is_suspended || user.is_suspended ? "Restricted" : "Active Session"}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    {(() => {
                      const info = getInactivityInfo(user.user?.last_seen || user.last_seen);
                      return (
                        <>
                          <span className={`text-xs font-bold ${info.color}`}>
                            {info.text}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Since last login</span>
                        </>
                      );
                    })()}
                  </div>
                </td>

                {type === "freelancer" && (
                  <td className="px-6 py-5">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic max-w-[150px] truncate">
                      {user.user?.suspended_reason || user.suspended_reason || "---"}
                    </p>
                  </td>
                )}

                <td className="px-6 py-5 text-center">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {type === "freelancer" && !user.freelancer_profile?.profile_approved && (
                      <button 
                        onClick={() => handleStatusChange(user.freelancer_profile?.id, "approve")}
                        disabled={loadingId === user.freelancer_profile?.id}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                        title="Approve Profile"
                      >
                        <FiUserCheck size={16} />
                      </button>
                    )}
                    {type === "freelancer" && user.freelancer_profile?.profile_approved && (
                      <button 
                        onClick={() => handleUnverify(user)}
                        disabled={loadingId === user.id}
                        className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200 dark:shadow-none disabled:opacity-50"
                        title="Unverify Profile"
                      >
                        <FiUserX size={16} />
                      </button>
                    )}
                    <a 
                      href={`/freelancer/${user.user?.username || user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="View Public Profile"
                    >
                      <FiEye size={16} />
                    </a>
                    
                    {user.user?.is_suspended || user.is_suspended ? (
                       <button 
                        onClick={() => handleUnsuspend(user.user?.id || user.id)}
                        disabled={loadingId === (user.user?.id || user.id)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-50" 
                        title="Remove Restriction"
                       >
                        <FiUserCheck size={16} />
                       </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setTargetUser(user.user || user);
                          setShowSuspendModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
                        title="Restrict Access"
                      >
                        <FiUserX size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pagination && (
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            Showing <span className="text-slate-900 dark:text-white">{pagination.from || 0}</span> to <span className="text-slate-900 dark:text-white">{pagination.to || 0}</span> of <span className="text-slate-900 dark:text-white">{pagination.total}</span> records
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1 || isDataLoading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.last_page))].map((_, i) => {
                const pNum = i + 1; // Simplistic page range
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      page === pNum 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
              {pagination.last_page > 5 && <span className="text-slate-400 px-1">...</span>}
            </div>
            <button 
              disabled={page === pagination.last_page || isDataLoading}
              onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
