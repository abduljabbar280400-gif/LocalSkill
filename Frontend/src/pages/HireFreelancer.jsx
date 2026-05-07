import { Link } from "react-router-dom";
import usePageSEO from "../hooks/usePageSEO";
import {
  FaMapMarkerAlt,
  FaBolt,
  FaUserTie,
  FaClipboardList,
  FaHandshake,
  FaCheckCircle,
  FaSearch,
  FaStar,
  FaPlug,
  FaWrench,
  FaBroom,
  FaCamera,
  FaHammer,
  FaBox,
  FaLeaf,
  FaLaptop,
} from "react-icons/fa";

import NearbyFreelancers from "../components/profile/hire-freelancer/NearbyFreelancers";

export default function HireFreelancer() {
  usePageSEO({
    title: "Find & Hire Local Professionals | LocalSkill",
    description: "Find trusted local freelancers for your next project. Post your requirements for free and get connected with verified professionals near you.",
    keywords: "hire freelancers, post a project, local talent, find professionals, verified workers",
  });
  return (
    <main className="app-main bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden font-['Inter',sans-serif]">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden" aria-labelledby="hire-hero-heading">
        {/* Background Gradients - desktop only */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-[120px] rounded-full -z-10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20 pointer-events-none" aria-hidden="true"></div>

        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/80 dark:bg-slate-800/80 text-blue-700 dark:text-blue-300 font-semibold text-sm border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                The #1 Local Freelance Platform
              </div>
              <h1 id="hire-hero-heading" className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight text-slate-900 dark:text-white tracking-tight">
                Find{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                  Trusted Freelancers
                </span>{" "}
                Near You
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Post your project and instantly connect with verified,
                highly-skilled local professionals. Experience faster hiring,
                deeper trust, and exceptional results.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  to="/hire-freelancer/signup"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 dark:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Post a Project Free <FaBolt className="text-amber-400" aria-hidden="true" />
                </Link>
                <Link
                  to="/hire-freelancer/login"
                  className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center"
                >
                  Log In to Account
                </Link>
              </div>

              <ul className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 list-none" aria-label="Platform guarantees">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500 text-lg" aria-hidden="true" />
                  <span>No upfront fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500 text-lg" aria-hidden="true" />
                  <span>Verified profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500 text-lg" aria-hidden="true" />
                  <span>Secure payments</span>
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
                      <FaUserTie />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">Alex M.</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Plumbing Expert</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1 font-semibold text-amber-500"><FaStar /> 4.9</span>
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md font-medium">Available Now</span>
                  </div>
                </div>

                <div className="hidden md:block absolute bottom-[8%] -left-12 w-72 p-5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-2xl shadow-2xl dark:shadow-black/50 z-30" aria-hidden="true">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-inner">
                      <FaClipboardList className="text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">New Proposal Received!</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        "I can help fix your electrical wiring issue today. I'm located just 2 miles away..."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Central Circle */}
                <div className="absolute inset-[15%] rounded-full border-2 border-dashed border-blue-300/50 dark:border-blue-700/50 flex items-center justify-center bg-white/30 dark:bg-slate-900/30 z-10" aria-hidden="true">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl shadow-lg shadow-blue-500/40">
                    <FaSearch />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="py-24 bg-white dark:bg-slate-800/50 relative border-y border-slate-200 dark:border-slate-700/50" aria-labelledby="hire-features-heading">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 id="hire-features-heading" className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Why Hire on Our Platform?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              We make it incredibly easy to find, evaluate, and work with the
              best local talent for your next project.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" role="list">
            {[
              { icon: FaMapMarkerAlt, title: "Location-Based Hiring", desc: "Find freelancers near you for faster, more reliable service. Perfect for on-site jobs and quick repairs.", color: "blue" },
              { icon: FaHandshake, title: "Hire with Confidence", desc: "Review past work, read authentic client ratings, and interview candidates securely before starting.", color: "indigo" },
              { icon: FaBolt, title: "Get Work Done Fast", desc: "Manage milestones, communicate instantly, and pay securely when the job meets your exact expectations.", color: "emerald" },
            ].map((feature, i) => (
              <div
                key={i}
                role="listitem"
                className="bg-white dark:bg-slate-800/90 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl
                  ${feature.color === "blue" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : ""}
                  ${feature.color === "indigo" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : ""}
                  ${feature.color === "emerald" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
                `}
                >
                  <feature.icon aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-900" aria-labelledby="hire-categories-heading">
        <div className="hidden md:block absolute -right-[20%] top-[10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full z-0 pointer-events-none" aria-hidden="true"></div>
        <div className="hidden md:block absolute -left-[10%] bottom-[10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full z-0 pointer-events-none" aria-hidden="true"></div>

        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 id="hire-categories-heading" className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                Trending Skills & Services
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Find exactly what you need. From quick home repairs to complex
                digital projects, our local experts have you covered.
              </p>
            </div>
            <Link
              to="/find-freelancers"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Browse all services &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" role="list">
            {[
              { name: "Electrician", icon: FaPlug },
              { name: "Plumbing", icon: FaWrench },
              { name: "Cleaning", icon: FaBroom },
              { name: "Photography", icon: FaCamera },
              { name: "Carpentry", icon: FaHammer },
              { name: "Delivery", icon: FaBox },
              { name: "Landscaping", icon: FaLeaf },
              { name: "Tech Repair", icon: FaLaptop },
            ].map((item, i) => (
              <div
                key={i}
                role="listitem"
                className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-sm"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center mb-4">
                  <item.icon className="text-2xl text-slate-500 dark:text-slate-400" aria-hidden="true" />
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-lg">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ NEARBY FREELANCERS ═══════════ */}
      <div className="relative z-10">
        <NearbyFreelancers />
      </div>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-28 relative overflow-hidden" aria-labelledby="hire-cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950" aria-hidden="true">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-30"></div>
          <div className="hidden md:block absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/40 blur-[120px] rounded-full"></div>
          <div className="hidden md:block absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/40 blur-[120px] rounded-full"></div>
        </div>

        <div className="container max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="bg-white/95 dark:bg-slate-900/90 md:bg-white/10 md:dark:bg-black/20 md:backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden">
            <h2 id="hire-cta-heading" className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-900 md:text-white dark:text-white leading-tight">
              Ready to bring your project to life?
            </h2>
            <p className="mb-10 text-slate-600 md:text-blue-50 dark:text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Join thousands of clients who have successfully found top local
              talent. Post your project today for free and get matched
              instantly.
            </p>

            <Link
              to="/hire-freelancer/signup"
              className="inline-flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 bg-blue-600 md:bg-white text-white md:text-blue-600 rounded-xl font-bold text-lg shadow-xl shadow-black/10 hover:bg-blue-700 md:hover:bg-slate-50 hover:scale-105 transition-all duration-300 group"
            >
              Get Started Now{" "}
              <FaBolt className="text-amber-400 group-hover:animate-bounce" aria-hidden="true" />
            </Link>
            <p className="mt-6 text-sm text-slate-500 md:text-blue-200/80 dark:text-slate-400 font-medium tracking-wide uppercase">
              No Payment required to post a project
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
