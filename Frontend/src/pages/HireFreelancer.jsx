import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaBolt,
  FaUserTie,
  FaClipboardList,
  FaHandshake,
} from "react-icons/fa";

export default function HireFreelancer() {
  return (
    <main className="app-main bg-gray-50 text-gray-800">
      {/* ================= HERO ================= */}
      <section className="py-20 bg-white border-b">
        <div className="container max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Hire Trusted Freelancers Near You
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Post your project and instantly connect with skilled local
            freelancers. Faster hiring. Better trust. Real results.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/hire-freelancer/signup"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              to="/hire-freelancer/login"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* ================= QUICK PANEL ================= */}
      <section className="py-12">
        <div className="container max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Start a Project</h2>
            <p className="text-gray-600 mb-4">
              Create a client account and manage your projects, freelancers, and
              communication in one place.
            </p>

            <Link
              to="/hire-freelancer/signup"
              className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg"
            >
              Create Account
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold mb-3">What You Get</h2>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>✔ Verified freelancer profiles</li>
              <li>✔ Ratings & completed work history</li>
              <li>✔ Easy communication & tracking</li>
              <li>✔ Transparent hiring process</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-16 bg-white border-t">
        <div className="container max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-10">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <FaClipboardList className="text-3xl text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Post Your Project</h3>
              <p className="text-gray-600 text-sm">
                Describe your task and requirements in minutes.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <FaMapMarkerAlt className="text-3xl text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Get Local Matches</h3>
              <p className="text-gray-600 text-sm">
                Receive proposals from nearby skilled freelancers.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <FaHandshake className="text-3xl text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Hire & Work</h3>
              <p className="text-gray-600 text-sm">
                Choose the best freelancer and get your work done fast.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-10">
            Popular Services
          </h2>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              "Home Services",
              "Electrician",
              "Plumbing",
              "Cleaning",
              "Delivery",
              "Photography",
              "Carpentry",
              "Repairs",
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border rounded-xl p-5 hover:shadow-sm"
              >
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= USP SECTION ================= */}
      <section className="py-16 bg-white border-t">
        <div className="container max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-6">
            Why Choose Our Platform?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-600">
            <div className="text-center">
              <FaMapMarkerAlt className="text-2xl text-blue-600 mb-2 mx-auto" />
              <h3 className="font-semibold text-black mb-2">
                Location-Based Hiring
              </h3>
              <p>
                Find freelancers near you for faster and more reliable service.
              </p>
            </div>

            <div className="text-center">
              <FaBolt className="text-2xl text-blue-600 mb-2 mx-auto" />
              <h3 className="font-semibold text-black mb-2">Faster Hiring</h3>
              <p>Get responses quickly and hire within minutes, not days.</p>
            </div>

            <div className="text-center">
              <FaUserTie className="text-2xl text-blue-600 mb-2 mx-auto" />
              <h3 className="font-semibold text-black mb-2">
                Skilled Professionals
              </h3>
              <p>
                Work with verified freelancers with proven skills and ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 text-center bg-blue-600 text-white">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-4">
            Ready to hire the right freelancer?
          </h2>
          <p className="mb-6 text-blue-100">
            Start your first project today and connect with trusted local
            talent.
          </p>

          <Link
            to="/hire-freelancer/signup"
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium"
          >
            Post a Project
          </Link>
        </div>
      </section>
    </main>
  );
}
