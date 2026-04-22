import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

import {
  FaMapMarkerAlt,
  FaArrowRight,
  FaUserPlus,
  FaTools,
  FaBriefcase,
  FaTrophy,
  FaStar,
  FaMedal,
} from "react-icons/fa";

import { motion, useInView } from "framer-motion";

// ✅ CountUp Component (FIXED)
function CountUp({ end, duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const increment = Math.ceil(end / (duration * 60));

    const counter = setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);
        clearInterval(counter);
      } else {
        setCount(start);
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function FreelancerIntro() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [topFreelancers, setTopFreelancers] = useState([]);

  // ✅ Guards to prevent multiple calls
  const hasFetchedJobs = useRef(false);
  const hasFetchedFreelancers = useRef(false);

  // 🔥 Fetch Nearby Jobs + Location
  useEffect(() => {
    if (hasFetchedJobs.current) return;
    hasFetchedJobs.current = true;

    const fetchNearbyJobs = async (lat, lng) => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/projects/nearby?lat=${lat}&lng=${lng}`,
        );

        if (!res.ok) throw new Error("Jobs API failed");

        const data = await res.json();
        setJobs(data.data || []);

        const locRes = await fetch(
          `http://localhost:8000/api/location/from-coordinates?lat=${lat}&lng=${lng}`,
        );

        if (!locRes.ok) throw new Error("Location API failed");

        const locData = await locRes.json();

        if (locData.success) {
          setCity(locData.city);
        }
      } catch (err) {
        console.error("Jobs fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchNearbyJobs(position.coords.latitude, position.coords.longitude);
      },

      async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const postalCode = user?.postal_code || "620020";

          const res = await fetch(
            `http://localhost:8000/api/location/from-postal?postal_code=${postalCode}`,
          );

          if (!res.ok) throw new Error("Postal API failed");

          const loc = await res.json();

          if (loc.success) {
            fetchNearbyJobs(loc.lat, loc.lng);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error("Fallback location error:", err);
          setLoading(false);
        }
      },
    );
  }, []);

  // 🔥 Fetch Top Freelancers
  useEffect(() => {
    if (hasFetchedFreelancers.current) return;
    hasFetchedFreelancers.current = true;

    const fetchTopFreelancers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/freelancers/top");

        if (!res.ok) throw new Error("Freelancer API failed");

        const data = await res.json();
        setTopFreelancers(data.data || []);
      } catch (err) {
        console.error("Freelancer fetch error:", err);
      }
    };

    fetchTopFreelancers();
  }, []);

  // 🔥 Auto Loop Carousel
  useEffect(() => {
    if (jobs.length < 4) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentSlide((prev) => (prev === 1 ? 0 : 1));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobs, isPaused]);

  // 🔥 Resume Auto After Interaction
  useEffect(() => {
    if (!isPaused) return;

    const timeout = setTimeout(() => {
      setIsPaused(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isPaused]);

  const slides = [jobs.slice(0, 3), jobs.slice(3, 6)];

  return (
    <main className="bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-200">
      {/* HERO */}
      <section className="bg-white dark:bg-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Start earning with your skills —{" "}
              <span className="text-blue-600">near your location</span>
            </h1>

            <p className="mt-5 text-lg text-gray-600 dark:text-slate-400">
              Connect with nearby clients and get real work without bidding
              wars.
            </p>

            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500" />
              Jobs within 10–15 km radius
            </p>

            <div className="mt-6 flex gap-4">
              <Link
                to="/freelancer/login"
                className="flex items-center gap-2 px-6 py-3 rounded-lg "
              >
                Login
              </Link>

              <Link
                to="/freelancer/signup"
                className="flex items-center gap-2 px-6 text-white py-3 bg-blue-600  rounded-lg shadow hover:bg-blue-700"
              >
                Start earning <FaArrowRight />
              </Link>
            </div>
          </motion.div>

          <motion.img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216"
            className="rounded-2xl shadow-lg"
            alt="freelancer"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.03 }}
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-center mb-12">
          How it works
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { text: "Create account", icon: <FaUserPlus /> },
            { text: "Add skills & location", icon: <FaTools /> },
            { text: "Get matched with clients", icon: <FaBriefcase /> },
            { text: "Start earning", icon: <FaArrowRight /> },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-lg text-center"
            >
              <div className="text-blue-600 text-2xl mb-3 flex justify-center">
                {step.icon}
              </div>
              <p className="text-gray-600 dark:text-slate-400">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-white dark:bg-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            {
              img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
              title: "Work Near You",
              desc: "Get projects from clients in your area — no long-distance hassle.",
            },
            {
              img: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
              title: "Simple Dashboard",
              desc: "Track jobs, payments, and reviews easily in one place.",
            },
            {
              img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
              title: "You’re in Control",
              desc: "Accept only the projects you want — no pressure.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <img src={item.img} className="rounded-lg mb-4" />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* JOBS */}
      <section className="bg-gray-100 dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold">Jobs near you</h2>
            <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
              📍 15 km radius
            </span>
          </div>

          {loading ? (
            <p>Looking For Job Near by You...</p>
          ) : jobs.length === 0 ? (
            <p>Currently No jobs Around You</p>
          ) : (
            <>
              {/* SLIDER */}
              <div className="overflow-hidden relative">
                <motion.div
                  className="flex gap-6"
                  animate={{ x: `-${currentSlide * 100}%` }}
                  transition={{ duration: 0.6 }}
                >
                  {slides.map((group, i) => (
                    <div
                      key={i}
                      className="min-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center"
                    >
                      {group.map((job) => (
                        <div
                          key={job.id}
                          className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow hover:shadow-md transition flex flex-col justify-between h-full w-full max-w-sm"
                        >
                          {/* TOP CONTENT */}
                          <div>
                            <h3 className="font-semibold text-lg mb-3 line-clamp-2">
                              {job.title}
                            </h3>

                             <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                              <FaMapMarkerAlt className="text-blue-500" />
                              {city || job.postal_code}
                            </p>

                            <p className="text-xs text-gray-400 dark:text-slate-500">
                              📏 {Number(job.distance).toFixed(1)} km away
                            </p>
                          </div>

                          {/* BUTTON (BOTTOM FIXED) */}
                          <div className="mt-5">
                            <Link
                              to={`/projects/${job.slug}`}
                              className="w-full inline-flex justify-center items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                              View Details <FaArrowRight />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </motion.div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-blue-600 text-white py-14">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 text-center gap-6">
          <div>
            <h3 className="text-3xl font-bold">
              <CountUp end={1000} />+
            </h3>
            <p>Freelancers joined</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold">
              <CountUp end={500} />+
            </h3>
            <p>Projects completed</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold">
              <CountUp end={48} /> / 10
            </h3>
            <p>Average rating</p>
          </div>
        </div>
      </section>

      {/* Top Freelancer */}
      <section className="bg-white dark:bg-slate-800 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-16 flex justify-center items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Top Freelancers
          </h2>

          <div className="flex justify-center items-end gap-6">
            {/* 🥈 SECOND PLACE */}
            {topFreelancers[1] && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-gray-100 dark:bg-slate-700 p-6 rounded-2xl shadow-md w-56 text-center"
              >
                <div className="text-gray-400 text-xl mb-2 flex justify-center">
                  <FaMedal />
                </div>

                <img
                  src={`https://ui-avatars.com/api/?name=${topFreelancers[1].first_name}+${topFreelancers[1].last_name}`}
                  className="w-16 h-16 rounded-full mx-auto mb-3"
                />

                <h3 className="font-semibold">
                  {topFreelancers[1].first_name} {topFreelancers[1].last_name}
                </h3>

                <div className="flex justify-center text-yellow-400 my-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {topFreelancers[1].completed_jobs} jobs
                </p>
              </motion.div>
            )}

            {/* 🥇 FIRST PLACE (BIG) */}
            {topFreelancers[0] && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-yellow-100 to-white border-2 border-yellow-400 p-8 rounded-2xl shadow-xl w-64 scale-110 text-center relative"
              >
                {/* Crown */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-yellow-500 text-3xl">
                  <FaTrophy />
                </div>

                <img
                  src={`https://ui-avatars.com/api/?name=${topFreelancers[0].first_name}+${topFreelancers[0].last_name}`}
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white shadow"
                />

                <h3 className="font-semibold text-lg">
                  {topFreelancers[0].first_name} {topFreelancers[0].last_name}
                </h3>

                <div className="flex justify-center text-yellow-400 my-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <p className="text-sm text-gray-600 dark:text-slate-400">
                  ⭐ {Number(topFreelancers[0].average_rating).toFixed(1)}
                </p>

                <div className="flex justify-center items-center gap-2 mt-2 text-sm text-gray-600 dark:text-slate-400">
                  <FaBriefcase />
                  {topFreelancers[0].completed_jobs} jobs
                </div>
              </motion.div>
            )}

            {/* 🥉 THIRD PLACE */}
            {topFreelancers[2] && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-orange-50 p-6 rounded-2xl shadow-md w-56 text-center"
              >
                <div className="text-orange-400 text-xl mb-2 flex justify-center">
                  <FaMedal />
                </div>

                <img
                  src={`https://ui-avatars.com/api/?name=${topFreelancers[2].first_name}+${topFreelancers[2].last_name}`}
                  className="w-16 h-16 rounded-full mx-auto mb-3"
                />

                <h3 className="font-semibold">
                  {topFreelancers[2].first_name} {topFreelancers[2].last_name}
                </h3>

                <div className="flex justify-center text-yellow-400 my-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {topFreelancers[2].completed_jobs} jobs
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <Link
          to="/freelancer/signup"
          className="px-6 py-3 bg-blue-600 text-white rounded"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}
