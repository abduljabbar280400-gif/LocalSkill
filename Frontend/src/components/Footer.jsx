import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* About / Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-4">HireConnect</h2>
            <p className="text-gray-300">
              Connecting freelancers with top projects worldwide. Build, grow,
              and achieve your dreams.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-blue-500 transition-colors">
                <FaFacebookF />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-blue-700 transition-colors">
                <FaLinkedinIn />
              </a>
              <a href="#" className="hover:text-pink-500 transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/" className="hover:text-blue-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/projects"
                  className="hover:text-blue-400 transition-colors"
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="hover:text-blue-400 transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/profile"
                  className="hover:text-blue-400 transition-colors"
                >
                  Profile
                </a>
              </li>
            </ul>
          </div>

          {/* Services / Resources */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="/hire-freelancer"
                  className="hover:text-blue-400 transition-colors"
                >
                  Hire Freelancer
                </a>
              </li>
              <li>
                <a
                  href="/post-project"
                  className="hover:text-blue-400 transition-colors"
                >
                  Post a Project
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:text-blue-400 transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="hover:text-blue-400 transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Subscribe for latest project updates and tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-5 py-3 rounded-lg text-gray-900 border border-white/20 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} HireConnect. All rights reserved. |
          <a href="/terms" className="hover:text-blue-400 mx-1">
            Terms
          </a>{" "}
          |
          <a href="/privacy" className="hover:text-blue-400 mx-1">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
