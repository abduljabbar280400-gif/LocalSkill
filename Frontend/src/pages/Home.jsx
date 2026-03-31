import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiMapPin,
  FiBarChart2,
  FiZap,
  FiLock,
  FiMap,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";
import {
  motion,
  useViewportScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

export default function Home() {
  // Animated counters
  const [completedJobs, setCompletedJobs] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [openProjects, setOpenProjects] = useState(0);

  useEffect(() => {
    const targetJobs = 24;
    const targetRating = 48;
    const targetProjects = 3;

    const duration = 1500;
    const intervalTime = 30;
    let jobs = 0,
      rating = 0,
      projects = 0;
    const steps = duration / intervalTime;
    const jobsStep = targetJobs / steps;
    const ratingStep = targetRating / steps;
    const projectsStep = targetProjects / steps;

    const counter = setInterval(() => {
      jobs += jobsStep;
      rating += ratingStep;
      projects += projectsStep;

      setCompletedJobs(Math.min(Math.floor(jobs), targetJobs));
      setAvgRating(Math.min((rating / 10).toFixed(1), targetRating / 10));
      setOpenProjects(Math.min(Math.floor(projects), targetProjects));

      if (
        jobs >= targetJobs &&
        rating >= targetRating &&
        projects >= targetProjects
      ) {
        clearInterval(counter);
      }
    }, intervalTime);

    return () => clearInterval(counter);
  }, []);

  // Motion variants
  const cardVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };
  const heroVariant = {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  };

  // Parallax scroll
  const { scrollY } = useViewportScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -50]);
  const featuresY = useTransform(scrollY, [0, 1000], [0, -30]);
  const howItWorksY = useTransform(scrollY, [0, 1500], [0, -20]);
  const ctaY = useTransform(scrollY, [0, 2000], [0, -25]);

  // Floating icons motion variant
  const floatingIcon = {
    animate: {
      y: ["0%", "5%", "0%"],
      x: ["0%", "5%", "0%"],
      rotate: [0, 15, -15, 0],
      transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
    },
  };

  // Testimonials carousel
  const testimonialsData = [
    {
      id: 1,
      text: "This platform helped me find great freelancers quickly!",
      name: "User 1",
    },
    {
      id: 2,
      text: "Easy to use and very reliable for finding local talent.",
      name: "User 2",
    },
    {
      id: 3,
      text: "I got my project done on time with skilled freelancers.",
      name: "User 3",
    },
    {
      id: 4,
      text: "Highly recommend this for clients and freelancers alike!",
      name: "User 4",
    },
    {
      id: 5,
      text: "The dashboards make managing projects very easy.",
      name: "User 5",
    },
    {
      id: 6,
      text: "Excellent platform with verified freelancers nearby.",
      name: "User 6",
    },
  ];
  const [testimonialIndex, setTestimonialIndex] = useState(1);
  const totalTestimonials = testimonialsData.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % totalTestimonials);
    }, 4000);
    return () => clearInterval(interval);
  }, [totalTestimonials]);

  const getVisibleTestimonials = () => {
    return [
      testimonialsData[
        (testimonialIndex - 1 + totalTestimonials) % totalTestimonials
      ], // left
      testimonialsData[testimonialIndex % totalTestimonials], // center
      testimonialsData[(testimonialIndex + 1) % totalTestimonials], // right
    ];
  };
  const visibleTestimonials = getVisibleTestimonials();

  return (
    <main className="app-main bg-gray-50 min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <motion.section className="page relative py-20" style={{ y: heroY }}>
        {/* Floating background icons */}
        <motion.div
          className="absolute -top-10 -left-10 text-primary text-6xl opacity-10 -z-10"
          variants={floatingIcon}
          animate="animate"
        >
          <FiUser />
        </motion.div>
        <motion.div
          className="absolute top-20 right-10 text-purple-300 text-7xl opacity-10 -z-10"
          variants={floatingIcon}
          animate="animate"
        >
          <FiBriefcase />
        </motion.div>
        <motion.div
          className="absolute bottom-10 left-1/2 text-pink-300 text-6xl opacity-10 -z-10"
          variants={floatingIcon}
          animate="animate"
        >
          <FiZap />
        </motion.div>

        <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-12 relative z-10">
          {/* Left Content */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold leading-tight"
              variants={heroVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              Find the right <span className="text-primary">local skill</span>{" "}
              in minutes
            </motion.h1>
            <motion.p
              className="text-gray-700 text-lg md:text-xl"
              variants={heroVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              Connect clients with nearby freelancers for jobs that need a
              quick, trustworthy pair of hands — from development and design to
              on-site work.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-6 justify-center md:justify-start"
              variants={heroVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <Link
                to="/hire-freelancer"
                className="btn btn-primary px-6 py-3 rounded-md text-white font-semibold hover:scale-105 transition-transform duration-300"
              >
                Hire a freelancer
              </Link>
              <Link
                to="/freelancer"
                className="btn btn-outline border border-primary text-primary px-6 py-3 rounded-md font-semibold hover:bg-primary hover:text-white transition-colors duration-300"
              >
                Become a freelancer
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start text-gray-600"
              variants={heroVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-primary" /> Verified profiles
              </span>
              <span className="flex items-center gap-2">
                <FiMapPin className="text-primary" /> Location-aware search
              </span>
              <span className="flex items-center gap-2">
                <FiBarChart2 className="text-primary" /> Clear dashboards
              </span>
            </motion.div>
          </div>

          {/* Right Stats Panel */}
          <aside className="flex-1 max-w-md bg-white p-6 rounded-xl shadow-lg relative z-10">
            <p className="text-gray-500 mb-6">
              A quick snapshot of what your dashboards can look like.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <motion.div
                className="stat-card bg-gray-50 p-4 rounded-lg shadow-sm"
                variants={cardVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-gray-500 text-sm font-medium">
                  Completed Jobs
                </div>
                <div className="text-2xl font-bold text-primary">
                  {completedJobs}
                </div>
              </motion.div>
              <motion.div
                className="stat-card bg-gray-50 p-4 rounded-lg shadow-sm"
                variants={cardVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-gray-500 text-sm font-medium">
                  Avg. Rating
                </div>
                <div className="text-2xl font-bold text-primary">
                  {avgRating}
                </div>
              </motion.div>
              <motion.div
                className="stat-card bg-gray-50 p-4 rounded-lg shadow-sm"
                variants={cardVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-gray-500 text-sm font-medium">
                  Open Projects
                </div>
                <div className="text-2xl font-bold text-primary">
                  {openProjects}
                </div>
              </motion.div>
            </div>
          </aside>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section className="py-16 relative" style={{ y: featuresY }}>
        {/* Floating icons */}
        <motion.div
          className="absolute top-0 left-1/4 text-primary text-6xl opacity-10 -z-10"
          variants={floatingIcon}
          animate="animate"
        >
          <FiZap />
        </motion.div>
        <motion.div
          className="absolute bottom-10 right-1/4 text-purple-300 text-7xl opacity-10 -z-10"
          variants={floatingIcon}
          animate="animate"
        >
          <FiMap />
        </motion.div>

        <div className="container mx-auto px-4 text-center space-y-12 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Why choose our platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="feature-card bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <FiZap className="text-3xl mb-4 text-primary mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Fast & Reliable</h3>
              <p className="text-gray-600">
                Get local freelancers quickly for urgent tasks.
              </p>
            </motion.div>
            <motion.div
              className="feature-card bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <FiLock className="text-3xl mb-4 text-primary mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Verified Talent</h3>
              <p className="text-gray-600">
                Profiles are checked for authenticity and skill.
              </p>
            </motion.div>
            <motion.div
              className="feature-card bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <FiMap className="text-3xl mb-4 text-primary mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Location Aware</h3>
              <p className="text-gray-600">
                Easily find freelancers near you for on-site work.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="py-16 bg-white relative"
        style={{ y: howItWorksY }}
      >
        <motion.div
          className="absolute top-10 left-10 text-yellow-300 text-6xl opacity-10 -z-10"
          variants={floatingIcon}
          animate="animate"
        />
        <div className="container mx-auto px-4 text-center space-y-12 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <FiUser className="text-3xl mb-4 text-primary mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create an account as client or freelancer quickly.
              </p>
            </motion.div>
            <motion.div
              className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <FiBriefcase className="text-3xl mb-4 text-primary mx-auto" />
              <h3 className="text-xl font-semibold mb-2">
                Find or Post Projects
              </h3>
              <p className="text-gray-600">
                Clients post jobs, freelancers browse and apply.
              </p>
            </motion.div>
            <motion.div
              className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <FiCheckCircle className="text-3xl mb-4 text-primary mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Work & Get Paid</h3>
              <p className="text-gray-600">
                Complete projects and track payments securely.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Updated Testimonials Section */}
      <motion.section className="py-16 relative">
        <motion.div
          className="absolute top-0 left-10 text-blue-300 text-6xl opacity-10 -z-10"
          variants={floatingIcon}
          animate="animate"
        />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Users Say
          </h2>

          <div className="relative flex justify-center items-center h-80">
            <AnimatePresence initial={false}>
              {visibleTestimonials.map((card, idx) => {
                const isCenter = idx === 1;
                return (
                  <motion.div
                    key={card.id}
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                      x: idx === 0 ? -160 : 160,
                    }}
                    animate={{
                      opacity: isCenter ? 1 : 0.5,
                      scale: isCenter ? 1.25 : 0.95,
                      x: idx === 0 ? -240 : idx === 2 ? 240 : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.8, x: idx === 0 ? -160 : 160 }}
                    transition={{ duration: 1 }}
                    className="w-80 bg-white p-6 rounded-xl shadow-lg text-center flex-shrink-0 absolute left-1/2 -translate-x-1/2"
                    style={{ zIndex: isCenter ? 10 : 5 }}
                  >
                    <FiUser className="text-4xl text-primary mx-auto mb-4" />
                    <p className="text-gray-700">{card.text}</p>
                    <h4 className="mt-4 font-semibold text-gray-900">
                      {card.name}
                    </h4>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16 bg-white text-center relative"
        style={{ y: ctaY }}
      >
        <motion.div
          className="absolute -top-10 right-10 text-purple-300 text-6xl opacity-10 -z-10"
          variants={floatingIcon}
          animate="animate"
        />
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-6"
          variants={heroVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Ready to get started?
        </motion.h2>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={heroVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/hire-freelancer"
            className="btn btn-primary px-8 py-3 rounded-md text-white font-semibold hover:scale-105 transition-transform duration-300"
          >
            Hire a freelancer
          </Link>
          <Link
            to="/freelancer"
            className="btn btn-outline border border-primary text-primary px-8 py-3 rounded-md font-semibold hover:bg-primary hover:text-white transition-colors duration-300"
          >
            Become a freelancer
          </Link>
        </motion.div>
      </motion.section>
    </main>
  );
}
