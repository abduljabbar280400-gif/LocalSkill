import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import usePageSEO from "../hooks/usePageSEO";
import {
  FiCheckCircle,
  FiMapPin,
  FiBarChart2,
  FiZap,
  FiLock,
  FiMap,
  FiUser,
} from "react-icons/fi";

/* ── Testimonials (simple CSS-only carousel) ── */
const TestimonialsCarousel = () => {
  const testimonialsData = [
    { id: 1, text: "This platform helped me find great freelancers quickly!", name: "User 1" },
    { id: 2, text: "Easy to use and very reliable for finding local talent.", name: "User 2" },
    { id: 3, text: "I got my project done on time with skilled freelancers.", name: "User 3" },
    { id: 4, text: "Highly recommend this for clients and freelancers alike!", name: "User 4" },
    { id: 5, text: "The dashboards make managing projects very easy.", name: "User 5" },
    { id: 6, text: "Excellent platform with verified freelancers nearby.", name: "User 6" },
  ];
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonialsData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonialsData.length]);

  const card = testimonialsData[testimonialIndex];

  return (
    <div className="relative flex justify-center items-center h-64" aria-live="polite" aria-atomic="true">
      <figure
        key={card.id}
        className="w-80 p-8 rounded-3xl text-center bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 transition-opacity duration-700"
      >
        <FiUser className="text-4xl text-blue-500 mx-auto mb-4" aria-hidden="true" />
        <blockquote className="text-slate-600 dark:text-slate-300 leading-relaxed italic">"{card.text}"</blockquote>
        <figcaption className="mt-6 font-bold text-slate-900 dark:text-white">{card.name}</figcaption>
      </figure>
    </div>
  );
};

/* ── Main Home Page ── */
export default function Home() {
  usePageSEO({
    title: "Hire Best Local Freelancers | LocalSkill",
    description: "Connect with verified local freelancers for design, development, and home services. LocalSkill makes hiring nearby professionals fast, secure, and easy.",
    keywords: "local freelancers, hire local talent, find projects near me, verified freelancers, local services",
  });

  return (
    <main className="app-main bg-slate-50 dark:bg-slate-900 min-h-screen relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background Gradient - desktop only */}
      <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl rounded-full -z-10 dark:from-blue-600/10 dark:via-indigo-600/10 dark:to-purple-600/10 pointer-events-none" aria-hidden="true"></div>

      {/* ═══════════ Hero ═══════════ */}
      <section className="page relative pt-20 pb-16 lg:pt-28 lg:pb-24" aria-labelledby="hero-heading">
        <div className="container max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-20 relative z-10">
          <div className="flex-1 text-center md:text-left space-y-6">
            <h1 id="hero-heading" className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-slate-900 dark:text-white tracking-tight">
              Find the right <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">local skill</span>{" "}
              in minutes
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto md:mx-0">
              Connect clients with nearby freelancers for jobs that need a
              quick, trustworthy pair of hands — from development and design to
              on-site work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center md:justify-start">
              <Link
                to="/hire-freelancer"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 dark:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Hire a freelancer
              </Link>
              <Link
                to="/freelancer"
                className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center"
              >
                Become a freelancer
              </Link>
            </div>

            <ul className="flex flex-wrap gap-6 mt-8 justify-center md:justify-start text-sm font-medium text-slate-600 dark:text-slate-400 list-none" aria-label="Platform features">
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-emerald-500 text-lg" aria-hidden="true" /> Verified profiles
              </li>
              <li className="flex items-center gap-2">
                <FiMapPin className="text-blue-500 text-lg" aria-hidden="true" /> Location-aware search
              </li>
              <li className="flex items-center gap-2">
                <FiBarChart2 className="text-indigo-500 text-lg" aria-hidden="true" /> Clear dashboards
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════ Features ═══════════ */}
      <section className="py-24 relative bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700/50" aria-labelledby="features-heading">
        <div className="container max-w-7xl mx-auto px-6 text-center space-y-16 relative z-10">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Why choose our platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8" role="list">
            {[
              { icon: <FiZap aria-hidden="true" />, title: "Fast & Reliable", desc: "Get local freelancers quickly for urgent tasks.", color: "blue" },
              { icon: <FiLock aria-hidden="true" />, title: "Verified Talent", desc: "Profiles are checked for authenticity and skill.", color: "indigo" },
              { icon: <FiMap aria-hidden="true" />, title: "Location Aware", desc: "Easily find freelancers near you for on-site work.", color: "emerald" },
            ].map((f, i) => (
              <div
                key={i}
                role="listitem"
                className={`bg-white dark:bg-slate-800/90 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm`}
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-${f.color}-50 dark:bg-${f.color}-900/30 flex items-center justify-center mb-6 text-3xl text-${f.color}-600 dark:text-${f.color}-400 shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ How It Works ═══════════ */}
      <section className="py-24 bg-white dark:bg-slate-800 relative" aria-labelledby="how-it-works-heading">
        <div className="hidden md:block absolute -right-[20%] top-[10%] w-[500px] h-[500px] bg-indigo-500/10 blur-3xl rounded-full z-0 pointer-events-none" aria-hidden="true"></div>
        <div className="container max-w-7xl mx-auto px-6 text-center space-y-16 relative z-10">
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            How it works
          </h2>
          <ol className="grid md:grid-cols-3 gap-8 list-none">
            {[
              { num: 1, title: "Sign Up", desc: "Create an account as client or freelancer quickly.", color: "blue" },
              { num: 2, title: "Find or Post Projects", desc: "Clients post jobs, freelancers browse and apply.", color: "indigo" },
              { num: 3, title: "Work & Get Paid", desc: "Complete projects and track payments securely.", color: "purple" },
            ].map((step, i) => (
              <li
                key={i}
                className="p-8 bg-slate-50 dark:bg-slate-700/50 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                <div className={`w-16 h-16 mx-auto rounded-full bg-${step.color}-100 dark:bg-${step.color}-900/30 flex items-center justify-center mb-6 text-2xl font-bold text-${step.color}-600 dark:text-${step.color}-400`} aria-hidden="true">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══════════ Testimonials ═══════════ */}
      <section className="py-24 relative bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/50" aria-labelledby="testimonials-heading">
        <div className="hidden md:block absolute -left-[10%] bottom-[10%] w-[400px] h-[400px] bg-blue-500/10 blur-3xl rounded-full z-0 pointer-events-none" aria-hidden="true"></div>
        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">
            What Our Users Say
          </h2>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-28 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950" aria-hidden="true">
          <div className="hidden md:block absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-30"></div>
          <div className="hidden md:block absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/30 blur-3xl rounded-full"></div>
          <div className="hidden md:block absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/30 blur-3xl rounded-full"></div>
        </div>

        <div className="container max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="bg-white/95 dark:bg-slate-900/90 md:bg-white/10 md:dark:bg-black/20 md:backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden">
            <h2 id="cta-heading" className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-900 md:text-white dark:text-white leading-tight">
              Ready to get started?
            </h2>
            <p className="mb-10 text-slate-600 md:text-blue-50 dark:text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who have successfully connected and completed amazing projects locally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/hire-freelancer"
                className="px-8 py-4 bg-blue-600 md:bg-white text-white md:text-blue-600 rounded-xl font-bold text-lg shadow-xl shadow-black/10 hover:bg-blue-700 md:hover:bg-slate-50 hover:scale-105 transition-all duration-300"
              >
                Hire a freelancer
              </Link>
              <Link
                to="/freelancer"
                className="px-8 py-4 bg-slate-100 md:bg-transparent border border-slate-300 md:border-white/50 text-slate-700 md:text-white dark:text-white rounded-xl font-bold text-lg shadow-sm hover:bg-slate-200 md:hover:bg-white/10 transition-all duration-300"
              >
                Become a freelancer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
