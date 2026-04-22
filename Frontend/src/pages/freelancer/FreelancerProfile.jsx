import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";
import LocationPicker from "../../components/profile/freelancer/LocationPicker";
import { languages as languageOptions } from "../../constants/languages";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaStar,
  FaUser,
  FaCheckCircle,
  FaRegStar,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGlobe,
  FaCalendarAlt,
} from "react-icons/fa";
import { FiEdit2, FiShare2, FiMessageCircle } from "react-icons/fi";

export default function FreelancerProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState({});
  const [skills, setSkills] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userData, setUserData] = useState(null);

  const isOwner = user && user.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let response;
        if (isOwner) {
          response = await api.get(`/freelancer/${username}/my-profile`);
        } else {
          response = await api.get(`/freelancer/${username}/profile`);
        }

        setProfile(response.data.profile);
        setUserData(response.data.user);
        if (response.data.category) setCategory(response.data.category);
        if (response.data.skills) setSkills(response.data.skills);
        if (response.data.reviews) setReviews(response.data.reviews);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 404) navigate("/not-found");
          else if (err.response.status === 403) setError("This profile is private.");
          else setError("Something went wrong.");
        } else {
          setError("Server not reachable.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, isOwner, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-slate-400 font-medium animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-4 text-center">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
          <FaUser className="text-red-500 text-3xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{error}</h2>
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-500 hover:underline font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  function getRelativeTime(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    
    // Reset hours to compare dates only for "Today"
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const pastDate = new Date(past.getFullYear(), past.getMonth(), past.getDate());
    
    const diffInMs = today - pastDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return "a month ago";
  }

  function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  const getLanguageLabels = (codes) => {
    if (!codes || codes.length === 0) return [];
    return codes.map((code) => {
      const match = languageOptions.find((lang) => lang.value === code);
      return match ? match.label : code;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 md:px-6 py-8"
      >
        {/* COVER BANNER */}
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl mb-[-100px] group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 animate-gradient-xy" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          <div className="absolute top-6 right-6 flex gap-3">
             <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all shadow-lg">
                <FiShare2 size={20} />
             </button>
          </div>
        </div>

        {/* HEADER CARD */}
        <motion.div 
          variants={itemVariants}
          className="relative z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl px-6 md:px-10 py-8 flex flex-col md:flex-row items-center md:items-end gap-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800/50"
        >
          {/* AVATAR */}
          <div className="relative -mt-20 md:-mt-24">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-full rounded-[1.4rem] bg-white dark:bg-slate-800 flex items-center justify-center text-gray-400 text-5xl overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="opacity-20" />
                )}
              </div>
            </div>
            {/* ONLINE STATUS INDICATOR */}
            <span className={`absolute bottom-2 right-2 w-6 h-6 border-4 border-white dark:border-slate-900 rounded-full shadow-lg transition-colors duration-300 ${userData?.is_online ? "bg-green-500" : "bg-gray-400"}`} />
          </div>

          {/* INFO */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                {userData?.first_name} {userData?.last_name}
              </h1>
              {profile?.profile_approved && (
                <div className="flex items-center justify-center md:justify-start gap-1 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold uppercase tracking-wider">
                  <FaCheckCircle /> Verified
                </div>
              )}
            </div>

            <p className="text-indigo-600 dark:text-indigo-400 text-xl font-semibold mt-2">
              {profile.professional_title}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-4 text-gray-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-sm font-medium bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                <FaStar className="text-yellow-400" />
                <span className="text-gray-900 dark:text-white font-bold">{profile.average_rating || "0.0"}</span>
                <span className="opacity-60">({profile.total_reviews || 0} reviews)</span>
              </span>
              <span className="text-sm font-medium flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-pink-500" /> {profile.city}, {profile.country}
              </span>
              <span className="text-sm font-medium flex items-center gap-1.5 opacity-60 italic">
                @{username}
              </span>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="flex gap-3">
            {isOwner ? (
              <button
                onClick={() => navigate(`/freelancer/${username}/edit-profile`)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all font-bold group"
              >
                <FiEdit2 className="group-hover:rotate-12 transition-transform" /> Edit Profile
              </button>
            ) : (
              <>
                <button className="p-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-white rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  <FiMessageCircle size={22} />
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl shadow-xl shadow-blue-500/20 transition-all font-bold">
                  Hire Me
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-12 gap-8 mt-12">
          
          {/* LEFT CONTENT */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ABOUT */}
            <motion.section 
              variants={itemVariants}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/20 dark:border-slate-800/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                   <FaUser size={18} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">About Me</h2>
              </div>
              <p className="text-gray-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-line font-medium opacity-90">
                {profile.bio || "No bio provided yet."}
              </p>
            </motion.section>

            {/* SKILLS */}
            <motion.section 
              variants={itemVariants}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/20 dark:border-slate-800/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                   <FaBriefcase size={18} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Professional Skills</h2>
              </div>
              {skills.length === 0 ? (
                <p className="text-gray-400 italic">No skills listed yet.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-5 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-800/50 text-gray-700 dark:text-slate-200 rounded-xl font-bold border border-gray-200 dark:border-slate-700/50 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-default"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.section>

            {/* DETAILS GRID */}
            <motion.section 
              variants={itemVariants}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/20 dark:border-slate-800/50"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                   <FaGlobe size={18} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Details</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { label: "Category", value: category?.name || "N/A", icon: <FaBriefcase className="text-blue-500" /> },
                  { label: "Experience Level", value: capitalize(profile.experience_level), icon: <FaStar className="text-yellow-500" /> },
                  { label: "Preferred Work", value: capitalize(profile.preferred_work_type), icon: <FaCalendarAlt className="text-purple-500" /> },
                  { label: "Availability", value: capitalize(profile.availability_status), icon: <FaCheckCircle className="text-emerald-500" /> },
                  { label: "Languages", value: getLanguageLabels(profile.languages).join(", ") || "N/A", icon: <FaGlobe className="text-indigo-500" /> },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-colors">
                    <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-gray-900 dark:text-white font-bold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* LOCATION */}
            <motion.section 
              variants={itemVariants}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/20 dark:border-slate-800/50"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                   <FaMapMarkerAlt size={18} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Location & Address</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6 mb-8 px-2">
                 {[
                    ["Street", profile.street_address],
                    ["City", profile.city],
                    ["Landmark", profile.landmark || "-"],
                    ["State", profile.state],
                    ["Postcode", profile.postcode],
                    ["Country", profile.country],
                 ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                       <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">{label}</span>
                       <span className="text-gray-900 dark:text-white font-bold">{capitalize(value)}</span>
                    </div>
                 ))}
              </div>

              {profile.latitude && profile.longitude && (
                <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-slate-800 h-[300px] relative group">
                   <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                  <LocationPicker
                    postcode={profile.postcode}
                    latitude={profile.latitude}
                    longitude={profile.longitude}
                    readonly={true}
                    interactiveOnClick={false}
                    onLocationSelect={() => {}}
                  />
                </div>
              )}
            </motion.section>

            {/* REVIEWS */}
            <motion.section 
              variants={itemVariants}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/20 dark:border-slate-800/50"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <FaStar size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Client Reviews</h2>
                </div>
                
                <div className="flex items-center gap-4 bg-gray-100 dark:bg-slate-800 px-6 py-3 rounded-2xl">
                    <div className="text-center border-r border-gray-200 dark:border-slate-700 pr-4">
                        <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{profile.average_rating || "0.0"}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Average</p>
                    </div>
                    <div className="text-left">
                        <div className="flex gap-0.5 mb-1">
                           {[1,2,3,4,5].map(s => (
                              <FaStar key={s} className={s <= Math.round(profile.average_rating) ? "text-yellow-400 text-xs" : "text-gray-300 dark:text-slate-600 text-xs"} />
                           ))}
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{profile.total_reviews || 0} Total Reviews</p>
                    </div>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const percent = reviews.length === 0 ? 0 : (count / reviews.length) * 100;
                    return (
                      <div key={star} className="flex items-center gap-4">
                        <span className="w-6 text-sm font-bold text-gray-500">{star}★</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${percent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-bold text-gray-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                  <p className="text-gray-400 font-medium">No client reviews yet.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-transparent hover:border-indigo-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-lg border border-indigo-500/20">
                              {review.client_name?.[0].toUpperCase()}
                           </div>
                           <div>
                              <p className="font-black text-gray-900 dark:text-white">{capitalize(review.client_name)}</p>
                              <div className="flex gap-0.5 mt-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <FaStar key={s} className={s <= review.rating ? "text-yellow-400 text-xs" : "text-gray-200 dark:text-slate-700 text-xs"} />
                                ))}
                              </div>
                           </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          {getRelativeTime(review.created_at)}
                        </span>
                      </div>

                      {review.project_title && (
                        <div className="mb-3 px-3 py-1 bg-indigo-500/5 inline-block rounded-lg">
                           <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Project: <span className="text-gray-700 dark:text-slate-300 ml-1">{review.project_title}</span></p>
                        </div>
                      )}

                      <p className="text-gray-600 dark:text-slate-300 leading-relaxed font-medium">
                        "{review.review_comment}"
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              
              {/* RATE CARD */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-800/50 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                   <FaBriefcase size={80} />
                </div>
                
                <div className="text-center relative z-10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Hourly Investment</p>
                  <div className="flex justify-center items-end gap-1 mb-1">
                     <span className="text-5xl font-black text-gray-900 dark:text-white leading-none">
                       {profile.hourly_rate || 0}
                     </span>
                     <span className="text-lg font-bold text-gray-400 mb-1">
                       {profile.currency}
                     </span>
                  </div>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">per hour</p>
                </div>

                <div className="grid gap-3 mt-8">
                  {!isOwner && (
                    <>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all font-black text-lg">
                        Hire {userData?.first_name}
                      </button>
                      <button className="w-full bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-white py-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all font-bold">
                        Message
                      </button>
                    </>
                  )}
                  {isOwner && (
                    <button 
                      onClick={() => navigate(`/freelancer/${username}/edit-profile`)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all font-black"
                    >
                      Manage Profile
                    </button>
                  )}
                </div>

                {/* STATS MINI GRID */}
                <div className="grid grid-cols-3 gap-2 mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                      {profile.average_rating}
                    </p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rating</p>
                  </div>
                  <div className="text-center border-x border-gray-100 dark:border-slate-800">
                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                      {profile.total_reviews}
                    </p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                      {profile.completed_jobs || 0}
                    </p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Jobs</p>
                  </div>
                </div>
              </motion.div>

              {/* AVAILABILITY CARD */}
              <motion.div 
                variants={itemVariants}
                className="bg-indigo-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden"
              >
                 <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                 <div className="relative z-10 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Platform Status</p>
                       <h3 className="text-xl font-black mt-1">
                          {userData?.is_online ? "Online Now" : "Currently Offline"}
                       </h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_white] transition-all duration-500 ${userData?.is_online ? "bg-green-400 animate-pulse" : "bg-slate-400"}`} />
                    </div>
                 </div>
                 <p className="mt-4 text-xs font-medium opacity-80 italic">
                    {userData?.is_online ? "Active on LocalSkill" : `Last active ${userData?.last_seen ? getRelativeTime(userData.last_seen) : "some time ago"}`}
                 </p>
              </motion.div>

              {/* SHARE PROFILE */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/20 dark:border-slate-800/50 flex items-center justify-between"
              >
                 <p className="text-sm font-bold text-gray-500">Share Profile</p>
                 <div className="flex gap-2">
                    {["fb", "tw", "ln"].map(p => (
                       <div key={p} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors">
                          <FaGlobe size={14} />
                       </div>
                    ))}
                 </div>
              </motion.div>

            </div>
          </div>

        </div>
      </motion.div>

      {/* Global CSS for Animations */}
      <style>
        {`
          @keyframes gradient-xy {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient-xy {
            background-size: 400% 400%;
            animation: gradient-xy 15s ease infinite;
          }
        `}
      </style>
    </div>
  );
}
