import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const SOCIAL_LINKS = [
  { icon: FaFacebookF,  href: "https://facebook.com",  label: "Facebook",  hoverClass: "hover:text-blue-500"  },
  { icon: FaTwitter,    href: "https://twitter.com",   label: "Twitter",   hoverClass: "hover:text-blue-400"  },
  { icon: FaLinkedinIn, href: "https://linkedin.com",  label: "LinkedIn",  hoverClass: "hover:text-blue-700"  },
  { icon: FaInstagram,  href: "https://instagram.com", label: "Instagram", hoverClass: "hover:text-pink-500"  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <p className="text-2xl font-bold mb-4">LocalSkill</p>
            <p className="text-gray-300">
              Connecting freelancers with top projects worldwide. Build, grow,
              and achieve your dreams.
            </p>
            <nav aria-label="Social media links" className="flex space-x-4 mt-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label, hoverClass }) => (
                <a
                  key={label}
                  href={href}
                  className={`${hoverClass} transition-colors`}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2 text-gray-300">
              {[
                { to: "/",               label: "Home" },
                { to: "/projects",       label: "Projects" },
                { to: "/find-freelancers", label: "Find Freelancers" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-blue-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav aria-label="Services links">
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            <ul className="space-y-2 text-gray-300">
              {[
                { to: "/hire-freelancer", label: "Hire Freelancer" },
                { to: "/freelancer",      label: "Become a Freelancer" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-blue-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Newsletter</h2>
            <p className="text-gray-300 mb-4">
              Subscribe for the latest project updates and tips.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter signup"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
              className="w-full px-5 py-3 rounded-lg text-gray-900 dark:text-slate-100 dark:bg-slate-700 border border-white/20 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} LocalSkill. All rights reserved.{" "}
          |{" "}
          <Link to="/terms" className="hover:text-blue-400 mx-1">
            Terms
          </Link>
          |{" "}
          <Link to="/privacy" className="hover:text-blue-400 mx-1">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
