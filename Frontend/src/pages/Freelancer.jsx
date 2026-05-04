import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import usePageSEO from "../hooks/usePageSEO";
import {
  FaMapMarkerAlt,
  FaArrowRight,
  FaUserPlus,
  FaTools,
  FaBriefcase,
  FaTrophy,
  FaStar,
  FaMedal,
  FaWallet,
  FaClipboardList,
  FaUserCheck,
  FaSearch,
  FaBolt,
  FaCheckCircle,
} from "react-icons/fa";

function CountUp({ end, duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const increment = Math.ceil(end / (duration * 60));
          const counter = setInterval(() => {
            start += increment;
            if (start >= end) { setCount(end); clearInterval(counter); }
            else { setCount(start); }
          }, 1000 / 60);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function FreelancerIntro() {
  usePageSEO({
    title: "Earn with Your Skills Locally | LocalSkill",
    description: "Join as a freelancer and start earning from projects in your area. LocalSkill connects you with local clients looking for your specific expertise.",
    keywords: "freelance jobs, earn money locally, find work near me, freelancer signup, local projects",
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const hasFetchedJobs = useRef(false);
  const hasFetchedFreelancers = useRef(false);

  useEffect(() => {
    if (hasFetchedJobs.current) return;
    hasFetchedJobs.current = true;
    const fetchNearbyJobs = async (lat, lng) => {
      try {
        const res = await fetch(`http://localhost:8000/api/projects/nearby?lat=${lat}&lng=${lng}`);
        if (!res.ok) throw new Error("Jobs API failed");
        const data = await res.json();
        setJobs(data.data || []);
        const locRes = await fetch(`http://localhost:8000/api/location/from-coordinates?lat=${lat}&lng=${lng}`);
        if (!locRes.ok) throw new Error("Location API failed");
        const locData = await locRes.json();
        if (locData.success) setCity(locData.city);
      } catch (err) { console.error("Jobs fetch error:", err); }
      finally { setLoading(false); }
    };
    navigator.geolocation.getCurrentPosition(
      (position) => fetchNearbyJobs(position.coords.latitude, position.coords.longitude),
      async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const postalCode = user?.postal_code || "620020";
          const res = await fetch(`http://localhost:8000/api/location/from-postal?postal_code=${postalCode}`);
          if (!res.ok) throw new Error("Postal API failed");
          const loc = await res.json();
          if (loc.success) fetchNearbyJobs(loc.lat, loc.lng);
          else setLoading(false);
        } catch (err) { console.error("Fallback location error:", err); setLoading(false); }
      }
    );
  }, []);

  useEffect(() => {
    if (hasFetchedFreelancers.current) return;
    hasFetchedFreelancers.current = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:8000/api/freelancers/top");
        if (!res.ok) throw new Error("Freelancer API failed");
        const data = await res.json();
        setTopFreelancers(data.data || []);
      } catch (err) { console.error("Freelancer fetch error:", err); }
    })();
  }, []);

  useEffect(() => {
    if (jobs.length < 4) return;
    const interval = setInterval(() => { if (!isPaused) setCurrentSlide((prev) => (prev === 1 ? 0 : 1)); }, 3000);
    return () => clearInterval(interval);
  }, [jobs, isPaused]);

  useEffect(() => {
    if (!isPaused) return;
    const timeout = setTimeout(() => setIsPaused(false), 5000);
    return () => clearTimeout(timeout);
  }, [isPaused]);

  const slides = [jobs.slice(0, 3), jobs.slice(3, 6)];

  return (
    <main className="app-main bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden font-['Inter',sans-serif]">
      {/* HERO */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden" aria-labelledby="freelancer-hero-heading">
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-[120px] rounded-full -z-10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20 pointer-events-none" aria-hidden="true"></div>
        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/80 dark:bg-slate-800/80 text-blue-700 dark:text-blue-300 font-semibold text-sm border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Empowering Local Professionals
              </div>
              <h1 id="freelancer-hero-heading" className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight text-slate-900 dark:text-white tracking-tight">
                Start earning with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                  Your Skills
                </span>{" "}
                Locally
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect with nearby clients and get real work without bidding wars.
                Experience faster earnings, deeper trust, and local opportunities.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link to="/freelancer/signup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 dark:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2">
                  Start earning <FaArrowRight aria-hidden="true" />
                </Link>
                <Link to="/freelancer/login" className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center">
                  Log In to Account
                </Link>
              </div>

              <ul className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 list-none" aria-label="Platform benefits">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500 text-lg" aria-hidden="true" />
                  <span>Zero commission</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500 text-lg" aria-hidden="true" />
                  <span>Direct payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500 text-lg" aria-hidden="true" />
                  <span>Local clients</span>
                </li>
              </ul>
            </div>

            {/* Hero Visual */}
            <div className="w-full lg:w-1/2 relative mt-16 lg:mt-0">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                <div className="hidden md:block absolute inset-0 bg-gradient-to-tr from-blue-300/40 via-indigo-300/40 to-purple-300/40 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-purple-900/40 rounded-full blur-3xl opacity-70" aria-hidden="true"></div>

                {/* Glass Cards - desktop only for performance */}
                <div className="hidden md:block absolute top-[2%] -right-8 w-64 p-5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-2xl shadow-2xl dark:shadow-black/50 z-20" aria-hidden="true">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">
                      <FaUserCheck />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">Verified</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Pro Badge Earned</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1 font-semibold text-amber-500"><FaStar /> 5.0 Rating</span>
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md font-medium">Top Rated</span>
                  </div>
                </div>

                <div className="hidden md:block absolute bottom-[8%] -left-12 w-72 p-5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-2xl shadow-2xl dark:shadow-black/50 z-30" aria-hidden="true">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-inner">
                      <FaWallet className="text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Payment Received!</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        "Project 'House Electrical' completed. $250.00 has been added to your wallet."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Central Circle */}
                <div className="absolute inset-[15%] rounded-full border-2 border-dashed border-blue-300/50 dark:border-blue-700/50 flex items-center justify-center bg-white/30 dark:bg-slate-900/30 z-10" aria-hidden="true">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl shadow-lg shadow-blue-500/40">
                    <FaBriefcase />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-50 dark:bg-slate-900 py-24 relative border-y border-slate-200 dark:border-slate-700/50" aria-labelledby="freelancer-how-heading">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 id="freelancer-how-heading" className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">How it works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">Four simple steps to start growing your freelance business locally.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { text: "Create account", icon: <FaUserPlus /> },
              { text: "Add skills & location", icon: <FaTools /> },
              { text: "Get matched with clients", icon: <FaBriefcase /> },
              { text: "Start earning", icon: <FaArrowRight /> },
            ].map((step, index) => (
              <div key={index} className="bg-white dark:bg-slate-800/90 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-3xl text-blue-600 dark:text-blue-400 shadow-sm">
                  {step.icon}
                </div>
                <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-white dark:bg-slate-800 py-24 relative overflow-hidden" aria-labelledby="freelancer-benefits-heading">
        <div className="hidden md:block absolute -right-[20%] top-[10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full z-0 pointer-events-none" aria-hidden="true"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 id="freelancer-benefits-heading" className="sr-only">Benefits of freelancing on our platform</h2>
          <div className="grid md:grid-cols-3 gap-10">
          {[
            { img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d", title: "Work Near You", desc: "Get projects from clients in your area — no long-distance hassle." },
            { img: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df", title: "Simple Dashboard", desc: "Track jobs, payments, and reviews easily in one place." },
            { img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", title: "You're in Control", desc: "Accept only the projects you want — no pressure." },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="overflow-hidden rounded-3xl mb-6 shadow-lg border border-slate-200 dark:border-slate-700/50">
                <img src={item.img} className="w-full h-56 object-cover" alt={item.title} loading="lazy" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">{item.desc}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* JOBS */}
      <section className="bg-slate-50 dark:bg-slate-900 py-24 relative overflow-hidden" aria-labelledby="freelancer-jobs-heading">
        <div className="hidden md:block absolute -left-[10%] bottom-[10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full z-0 pointer-events-none" aria-hidden="true"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <h2 id="freelancer-jobs-heading" className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Jobs near you</h2>
            <span className="text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-200 dark:border-blue-800">
              <FaMapMarkerAlt aria-hidden="true" /> 15 km radius
            </span>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-20" role="status">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" aria-label="Loading jobs"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
              <p className="text-lg text-slate-600 dark:text-slate-400">Currently No jobs Around You</p>
            </div>
          ) : (
            <div className="overflow-hidden relative">
              <div className="flex gap-6 transition-transform duration-600 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((group, i) => (
                  <div key={i} className="min-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
                    {group.map((job) => (
                      <div key={job.id} className="bg-white dark:bg-slate-800/90 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-full w-full max-w-sm">
                        <div>
                          <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white line-clamp-2">{job.title}</h3>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                            <FaMapMarkerAlt className="text-blue-500" aria-hidden="true" /> {city || job.postal_code}
                          </p>
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 inline-block px-2 py-1 rounded-md">
                            📏 {Number(job.distance).toFixed(1)} km away
                          </p>
                        </div>
                        <div className="mt-6">
                          <Link to={`/projects/${job.slug}`} className="w-full inline-flex justify-center items-center gap-2 text-sm font-semibold bg-slate-50 dark:bg-slate-700/50 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-300 border border-slate-100 dark:border-slate-600">
                            View Details <FaArrowRight aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 text-center gap-10 relative z-10">
          {[
            { end: 1000, suffix: "+", label: "Freelancers joined" },
            { end: 500, suffix: "+", label: "Projects completed" },
            { end: 48, suffix: " / 10", label: "Average rating" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 dark:bg-black/20 md:backdrop-blur-md border border-white/20 p-8 rounded-3xl text-white shadow-xl">
              <h3 className="text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200">
                <CountUp end={stat.end} />{stat.suffix}
              </h3>
              <p className="text-blue-100 font-medium text-lg tracking-wide uppercase text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="bg-white dark:bg-slate-800 py-28 border-t border-slate-200 dark:border-slate-700/50" aria-labelledby="top-freelancers-heading">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 id="top-freelancers-heading" className="text-3xl md:text-4xl font-bold mb-20 flex justify-center items-center gap-3 text-slate-900 dark:text-white">
            <FaTrophy className="text-amber-500 text-4xl" aria-hidden="true" /> Top Freelancers
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-8 md:gap-6">
            {topFreelancers[1] && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 w-64 md:w-56 text-center relative">
                <div className="text-slate-400 dark:text-slate-500 text-3xl mb-4 flex justify-center" aria-hidden="true"><FaMedal /></div>
                <img src={`https://ui-avatars.com/api/?name=${topFreelancers[1].first_name}+${topFreelancers[1].last_name}`} className="w-20 h-20 md:w-16 md:h-16 rounded-full mx-auto mb-4 border-2 border-slate-200 dark:border-slate-600 shadow-sm" alt={`${topFreelancers[1].first_name} ${topFreelancers[1].last_name} avatar`} loading="lazy" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{topFreelancers[1].first_name} {topFreelancers[1].last_name}</h3>
                <div className="flex justify-center text-amber-400 my-3 text-sm">{[...Array(5)].map((_, i) => <FaStar key={i} />)}</div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{topFreelancers[1].completed_jobs} jobs</p>
              </div>
            )}
            {topFreelancers[0] && (
              <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-800 border-2 border-amber-400 dark:border-amber-500/50 p-8 rounded-3xl shadow-2xl w-72 md:w-64 md:scale-110 text-center relative z-10 md:mb-4">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 text-4xl drop-shadow-md" aria-hidden="true"><FaTrophy /></div>
                <img src={`https://ui-avatars.com/api/?name=${topFreelancers[0].first_name}+${topFreelancers[0].last_name}`} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-lg" alt={`${topFreelancers[0].first_name} ${topFreelancers[0].last_name} avatar`} loading="lazy" />
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">{topFreelancers[0].first_name} {topFreelancers[0].last_name}</h3>
                <div className="flex justify-center text-amber-400 my-3 text-lg">{[...Array(5)].map((_, i) => <FaStar key={i} />)}</div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">⭐ {Number(topFreelancers[0].average_rating).toFixed(1)}</p>
                <div className="flex justify-center items-center gap-2 mt-3 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <FaBriefcase className="text-blue-500" aria-hidden="true" /> {topFreelancers[0].completed_jobs} jobs
                </div>
              </div>
            )}
            {topFreelancers[2] && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 w-64 md:w-56 text-center relative">
                <div className="text-orange-400 text-3xl mb-4 flex justify-center" aria-hidden="true"><FaMedal /></div>
                <img src={`https://ui-avatars.com/api/?name=${topFreelancers[2].first_name}+${topFreelancers[2].last_name}`} className="w-20 h-20 md:w-16 md:h-16 rounded-full mx-auto mb-4 border-2 border-slate-200 dark:border-slate-600 shadow-sm" alt={`${topFreelancers[2].first_name} ${topFreelancers[2].last_name} avatar`} loading="lazy" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{topFreelancers[2].first_name} {topFreelancers[2].last_name}</h3>
                <div className="flex justify-center text-amber-400 my-3 text-sm">{[...Array(5)].map((_, i) => <FaStar key={i} />)}</div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{topFreelancers[2].completed_jobs} jobs</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative overflow-hidden" aria-labelledby="freelancer-cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950" aria-hidden="true">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-30"></div>
          <div className="hidden md:block absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/40 blur-[120px] rounded-full"></div>
          <div className="hidden md:block absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/40 blur-[120px] rounded-full"></div>
        </div>
        <div className="container max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="bg-white/95 dark:bg-slate-900/90 md:bg-white/10 md:dark:bg-black/20 md:backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden">
            <h2 id="freelancer-cta-heading" className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-900 md:text-white dark:text-white leading-tight">Ready to take control of your career?</h2>
            <p className="mb-10 text-slate-600 md:text-blue-50 dark:text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Join thousands of local professionals who are already finding great work on our platform. Sign up today and get matched with clients in your area.</p>
            <Link to="/freelancer/signup" className="inline-flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 bg-blue-600 md:bg-white text-white md:text-blue-600 rounded-xl font-bold text-lg shadow-xl shadow-black/10 hover:bg-blue-700 md:hover:bg-slate-50 hover:scale-105 transition-all duration-300 group">
              Join as a Freelancer <FaArrowRight className="text-white md:text-blue-500 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>

          </div>
        </div>
      </section>
    </main>
  );
}
