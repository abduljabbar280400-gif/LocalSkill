import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAvailabilityCheck from "../../hooks/useAvailabilityCheck";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";

import {
  validateEmail,
  validateUsername,
  validatePassword,
  getPasswordStrength,
  validateDOB,
} from "../../utils/validation";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiBriefcase,
  FiShield,
} from "react-icons/fi";

export default function Signup({ config }) {
  const navigate = useNavigate();
  const { register, type, routes } = config;

  const isFreelancer = type === "freelancer";

  const content = {
    freelancer: {
      sidebarGradient: "from-emerald-600 via-teal-700 to-blue-800",
      sidebarTitle: "Work on your own terms.",
      sidebarDesc: "Join a community of local experts. Find high-quality projects, build your reputation, and earn what you deserve.",
      features: [
        { icon: FiBriefcase, title: "Top Projects", desc: "Access the best local opportunities" },
        { icon: FiBriefcase, title: "Showcase Skills", desc: "Stand out with a professional profile" },
      ],
      heading: "Become a Freelancer",
      subheading: "Create your professional account and start applying.",
      buttonText: "Launch my career",
      accentColor: "emerald",
      btnGradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      shadowColor: "shadow-emerald-500/20",
      hoverShadow: "hover:shadow-emerald-500/40"
    },
    client: {
      sidebarGradient: "from-blue-600 via-indigo-700 to-purple-800",
      sidebarTitle: "Find experts in minutes.",
      sidebarDesc: "Post your project and instantly connect with verified local professionals. Get things done with confidence and quality.",
      features: [
        { icon: FiBriefcase, title: "Verified Talent", desc: "Hand-picked local experts" },
        { icon: FiShield, title: "Secure Hiring", desc: "Safe payments and verified reviews" },
      ],
      heading: "Hire Local Talent",
      subheading: "Join thousands of businesses hiring local experts.",
      buttonText: "Find my first expert",
      accentColor: "blue",
      btnGradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      shadowColor: "shadow-blue-500/20",
      hoverShadow: "hover:shadow-blue-500/40"
    }
  }[isFreelancer ? "freelancer" : "client"];

  const [form, setForm] = useState({
    title: "Mr",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    username: "",
    password: "",
    password_confirmation: "",
  });

  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRules = validatePassword(form.password);
  const passwordStrength = getPasswordStrength(passwordRules);

  const isValidUsername = validateUsername(form.username) && !errors.username;
  const isValidEmail = validateEmail(form.email) && !errors.email;

  // ✅ Availability checks
  const { status: usernameStatus } = useAvailabilityCheck(routes.username, "username", isValidUsername ? form.username : "");
  const { status: emailStatus } = useAvailabilityCheck(routes.email, "email", isValidEmail ? form.email : "");
  const { status: phoneStatus } = useAvailabilityCheck(routes.phone, "phone", form.phone && isValidPhoneNumber(form.phone) ? form.phone : "");

  const validateField = (name, value) => {
    if (!value && name !== "phone") return "This field is required";
    
    if (name === "dob") return validateDOB(value);
    if (name === "email" && value && !validateEmail(value)) return "Invalid email format";
    if (name === "username" && value && !validateUsername(value)) return "3-20 characters, alphanumeric/_ only";
    if (name === "password" && value) {
      const rules = validatePassword(value);
      return Object.values(rules).every(Boolean) ? "" : "Password does not meet requirements";
    }
    if (name === "password_confirmation" && value && value !== form.password) {
      return "Passwords do not match";
    }
    if (name === "phone" && value && !isValidPhoneNumber(value)) {
      return "Invalid phone number";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handlePhoneChange = (value) => {
    setForm(p => ({ ...p, phone: value || "" }));
    if (errors.phone) setErrors(p => ({ ...p, phone: "" }));
  };

  const handlePhoneBlur = () => {
    setTouched(prev => ({ ...prev, phone: true }));
    setErrors(prev => ({ ...prev, phone: validateField("phone", form.phone) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    const newErrors = {};
    const requiredFields = ["first_name", "last_name", "email", "dob", "username", "password", "password_confirmation"];
    
    requiredFields.forEach(f => {
      const err = validateField(f, form[f]);
      if (err) newErrors[f] = err;
    });

    if (form.phone && !isValidPhoneNumber(form.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    setErrors(newErrors);
    
    const allTouched = {};
    [...requiredFields, "phone"].forEach(f => allTouched[f] = true);
    setTouched(allTouched);

    if (Object.keys(newErrors).length > 0) {
      setGeneralError("Please fill in all required fields correctly.");
      return;
    }

    if (usernameStatus === false || emailStatus === false || phoneStatus === false) {
      setGeneralError("Some information is already in use.");
      return;
    }

    setLoading(true);
    try {
      const user = await register(form);
      navigate(routes.redirect(user.username));
    } catch (err) {
      setGeneralError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMatch = form.password && form.password_confirmation && form.password === form.password_confirmation;

  return (
    <main className="app-main bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[1100px] bg-white dark:bg-slate-900 shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row">
        
        {/* Left Side Branding (Desktop Only) */}
        <div className={`hidden lg:flex flex-col justify-between w-[45%] p-14 bg-gradient-to-br ${content.sidebarGradient} text-white relative overflow-hidden`}>
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-[80px]" />
            <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-white/10 blur-[80px]" />
            <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-white/10 blur-[80px]" />
          </div>

          <div className="relative z-10">
            <Link to="/" className="inline-block mb-16">
              <span className="text-2xl font-black tracking-tighter">LocalSkill<span className="text-white/50">.</span></span>
            </Link>
            
            <h2 className="text-4xl xl:text-5xl font-extrabold mb-6 leading-tight">{content.sidebarTitle}</h2>
            <p className="text-white/80 font-medium text-lg leading-relaxed max-w-md">
              {content.sidebarDesc}
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            {content.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                  <feature.icon className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-[55%] p-8 sm:p-12 xl:p-16 flex flex-col justify-center relative">
          <header className="mb-10">
            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 ${
              isFreelancer 
                ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            }`}>
              {isFreelancer ? "For Talent" : "For Clients"}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">{content.heading}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {content.subheading}
            </p>
          </header>

          {generalError && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/20 text-xs font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* 1. Personal Details: Title, First Name, Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <div className="relative h-[52px]">
                  <select 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    className="w-full h-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl px-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer [&>option]:bg-slate-50 [&>option]:dark:bg-slate-800 [&>option]:text-slate-900 [&>option]:dark:text-white"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Dr">Dr</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <div className="relative h-[52px]">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <input 
                    type="text" 
                    name="first_name" 
                    placeholder="John" 
                    value={form.first_name} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    className={`w-full h-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl pl-11 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium ${touched.first_name && errors.first_name ? "border-red-500 focus:ring-red-500 bg-red-50/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`} 
                  />
                </div>
                {touched.first_name && errors.first_name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.first_name}</p>}
              </div>
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <div className="relative h-[52px]">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <input 
                    type="text" 
                    name="last_name" 
                    placeholder="Doe" 
                    value={form.last_name} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    className={`w-full h-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl pl-11 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium ${touched.last_name && errors.last_name ? "border-red-500 focus:ring-red-500 bg-red-50/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`} 
                  />
                </div>
                {touched.last_name && errors.last_name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.last_name}</p>}
              </div>
            </div>

            {/* 2. Account Identity: Username, DOB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative h-[52px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10 pointer-events-none">@</span>
                  <input 
                    type="text" 
                    name="username" 
                    placeholder="johndoe" 
                    value={form.username} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    className={`w-full h-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl pl-10 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium ${touched.username && (errors.username || usernameStatus === false) ? "border-red-500 focus:ring-red-500 bg-red-50/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`} 
                  />
                </div>
                {touched.username && errors.username && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.username}</p>}
                {touched.username && !errors.username && usernameStatus === false && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">Username already taken</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                <div className="relative h-[52px]">
                  <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                  <input 
                    type="date" 
                    name="dob" 
                    value={form.dob} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    className={`w-full h-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl pl-11 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer dark:[color-scheme:dark] ${touched.dob && errors.dob ? "border-red-500 focus:ring-red-500 bg-red-50/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`} 
                  />
                </div>
                {touched.dob && errors.dob && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.dob}</p>}
              </div>
            </div>

            {/* 3. Contact Info: Email, Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative h-[52px]">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="john@example.com" 
                    value={form.email} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    className={`w-full h-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl pl-11 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium ${touched.email && (errors.email || emailStatus === false) ? "border-red-500 focus:ring-red-500 bg-red-50/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`} 
                  />
                </div>
                {touched.email && errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email}</p>}
                {touched.email && !errors.email && emailStatus === false && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">Email already in use</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative h-[52px] [&_select>option]:bg-slate-50 [&_select>option]:dark:bg-slate-800 [&_select>option]:text-slate-900 [&_select>option]:dark:text-white">
                  <PhoneInput 
                    international 
                    defaultCountry="IN" 
                    value={form.phone} 
                    onChange={handlePhoneChange} 
                    onBlur={handlePhoneBlur} 
                    className={`w-full h-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl px-4 text-slate-900 dark:text-white outline-none focus-within:ring-2 focus-within:ring-blue-500 transition-all font-medium ${touched.phone && (errors.phone || phoneStatus === false) ? "border-red-500 focus-within:ring-red-500 bg-red-50/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`} 
                  />
                </div>
                {touched.phone && errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.phone}</p>}
                {touched.phone && !errors.phone && phoneStatus === false && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">Phone number already in use</p>}
              </div>
            </div>

            {/* 4. Security: Password, Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative h-[52px]">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    className={`w-full h-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl pl-11 pr-12 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium ${touched.password && errors.password ? "border-red-500 focus:ring-red-500 bg-red-50/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10">
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {touched.password && errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative h-[52px]">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="password_confirmation" 
                    placeholder="••••••••" 
                    value={form.password_confirmation} 
                    onChange={handleChange} 
                    onBlur={handleBlur} 
                    className={`w-full h-full bg-slate-50 dark:bg-slate-800/50 border rounded-2xl pl-11 pr-12 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium ${touched.password_confirmation ? (isPasswordMatch ? "border-green-500 focus:ring-green-500" : "border-red-500 focus:ring-red-500 bg-red-50/30") : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`} 
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10">
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {touched.password_confirmation && form.password_confirmation && (
                  <p className={`text-[10px] font-bold mt-1 ml-1 ${isPasswordMatch ? "text-green-600" : "text-red-600"}`}>
                    {isPasswordMatch ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>
            </div>

            {/* Password Strength Checklist */}
            {form.password && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 mt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Password Strength</span>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${passwordStrength === "Strong" ? "text-green-600" : passwordStrength === "Medium" ? "text-yellow-600" : "text-red-600"}`}>
                    {passwordStrength}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    { label: "8+ characters", met: passwordRules.length },
                    { label: "Uppercase", met: passwordRules.uppercase },
                    { label: "Lowercase", met: passwordRules.lowercase },
                    { label: "Number", met: passwordRules.number },
                    { label: "Special char", met: passwordRules.special },
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all duration-300 ${rule.met ? "bg-green-500 scale-125" : "bg-slate-300 dark:bg-slate-700"}`} />
                      <span className={`text-[11px] font-semibold transition-colors duration-300 ${rule.met ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-600"}`}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              className={`w-full py-4 rounded-2xl font-extrabold text-white shadow-xl ${content.shadowColor} transition-all ${content.hoverShadow} hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] mt-8 flex items-center justify-center gap-3 ${loading ? "opacity-70 cursor-not-allowed hover:translate-y-0" : ""}`} 
              type="submit" 
              disabled={loading}
              style={{ background: content.btnGradient, height: '56px' }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>{content.buttonText}</span>
              )}
            </button>
          </form>

          <footer className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?{" "}
              <Link to={routes.login} className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all">
                Sign in here
              </Link>
            </p>
          </footer>
          
        </div>
      </div>
    </main>
  );
}
