import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield, FiActivity, FiGlobe, FiCpu } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/login", form);
      const { access_token, user } = res.data;

      if (user.role !== "admin") {
        toast.error("Unauthorized Access Detected");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_user", JSON.stringify(user));

      toast.success("Authentication Successful");
      
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 transition-colors duration-300">
      {/* Soft Mesh Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-100/50 dark:bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-100/50 dark:bg-indigo-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        
        {/* Title Tile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-xl shadow-indigo-500/5 transition-all duration-300"
        >
          <div>
            <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <FiShield className="text-white" size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Control <span className="text-indigo-600 dark:text-indigo-400">Central.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg max-w-md">
              The professional gateway for LocalSkill administrators. Secure, fast, and unified.
            </p>
          </div>
          <div className="flex gap-4 mt-8 md:mt-0">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <FiArrowLeft /> Back to platform
            </button>
          </div>
        </motion.div>

        {/* Login Tile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:row-span-2 bg-indigo-600 dark:bg-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 dark:shadow-black/40 flex flex-col justify-center relative overflow-hidden transition-colors duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-100 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@localskill.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-100 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-inner"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white dark:bg-slate-100 text-indigo-600 dark:text-indigo-700 font-bold py-4 rounded-2xl hover:bg-indigo-50 dark:hover:bg-white transition-all shadow-xl shadow-black/10 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              ) : "Sign In to Console"}
            </button>
          </form>
        </motion.div>

        {/* Stats Tile 1 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900/50 border border-white dark:border-slate-800 p-6 rounded-[2rem] shadow-lg shadow-indigo-500/5 flex items-center gap-4 transition-all duration-300"
        >
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
            <FiActivity size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">System Status</p>
            <p className="text-slate-900 dark:text-slate-200 font-bold">All Systems Nominal</p>
          </div>
        </motion.div>

        {/* Stats Tile 2 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900/50 border border-white dark:border-slate-800 p-6 rounded-[2rem] shadow-lg shadow-indigo-500/5 flex items-center gap-4 transition-all duration-300"
        >
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FiGlobe size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Global Region</p>
            <p className="text-slate-900 dark:text-slate-200 font-bold">Standard Node 01</p>
          </div>
        </motion.div>

      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
        &copy; {new Date().getFullYear()} LocalSkill Corp // Internal Use Only
      </div>
    </div>
  );
}
