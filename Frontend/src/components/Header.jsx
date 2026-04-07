import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useAuth } from "../context/useAuth";
import { useClientAuth } from "../context/client/useClientAuth";
import { useState, useEffect } from "react";

import NotificationBell from "../components/NotificationBell";

import {
  FiMenu,
  FiX,
  FiFolder,
  FiGrid,
  FiUser,
  FiLogOut,
  FiSearch,
  FiBell,
  FiMessageCircle,
  FiCompass,
} from "react-icons/fi";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const {
    user: freelancerUser,
    isAuthenticated: freelancerAuthenticated,
    logout: freelancerLogout,
    loading: freelancerLoading,
  } = useAuth();

  const {
    user: clientUser,
    isAuthenticated: clientAuthenticated,
    logout: clientLogout,
  } = useClientAuth();

  const path = location.pathname;

  const isFreelancerRoute = path.startsWith("/freelancer");
  const isClientRoute = path.startsWith("/hire-freelancer");

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (freelancerLoading) return null;

  /* ----------------------- */
  /* Styles */
  /* ----------------------- */
  const linkBase =
    "flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 font-medium transition-all";

  const hoverStyle = "";
  // "hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]";

  const activeStyle =
    "text-blue-600 shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]";

  const logoutButton =
    "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-red-500 bg-red-50/60 backdrop-blur border border-red-200/60 hover:bg-red-100/70 hover:text-red-600 transition-all duration-200";
  const primaryButton =
    "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-blue-600 bg-blue-50/60 backdrop-blur border border-blue-200/60 hover:bg-blue-100/70 hover:text-blue-700 transition-all duration-200";
  const freelancerButton =
    "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-emerald-600 bg-emerald-50/60 backdrop-blur border border-emerald-200/60 hover:bg-emerald-100/70 hover:text-emerald-700 transition-all duration-200";

  const isActive = (route) => location.pathname.startsWith(route);
  const linkClass = (route) =>
    `${linkBase} ${hoverStyle} ${isActive(route) ? activeStyle : ""}`;

  /* ----------------------- */
  /* Logout Handlers */
  /* ----------------------- */
  const logoutFreelancer = async () => {
    await freelancerLogout();
    navigate("/freelancer/login");
  };

  const logoutClient = async () => {
    await clientLogout();
    navigate("/hire-freelancer/login");
  };

  /* ----------------------- */
  /* Authenticated Nav Items Helper */
  /* ----------------------- */
  const getAuthNavItems = (user, role) => {
    if (!user) return [];

    // Consistent Order: Find Projects | Dashboard | My Projects | Profile
    if (role === "freelancer") {
      return [
        { to: "/projects", label: "Find Projects", icon: <FiSearch /> },
        {
          to: `/freelancer/${user.username}/dashboard`,
          label: "Dashboard",
          icon: <FiGrid />,
        },
        {
          to: `/freelancer/${user.username}/my-projects`,
          label: "My Works",
          icon: <FiFolder />,
        },
        {
          to: `/freelancer/${user.username}`,
          label: "My Profile",
          icon: <FiUser />,
        },
      ];
    }

    if (role === "client") {
      return [
        { to: "/projects", label: "Find Projects", icon: <FiSearch /> },
        {
          to: `/hire-freelancer/${user.username}/dashboard`,
          label: "Dashboard",
          icon: <FiGrid />,
        },
        {
          to: `/hire-freelancer/${user.username}/projects`,
          label: "My Projects",
          icon: <FiFolder />,
        },
        {
          to: `/hire-freelancer/${user.username}/profile`,
          label: "My Profile",
          icon: <FiUser />,
        },
      ];
    }

    return [];
  };

  /* ----------------------- */
  /* Navigation Items Logic */
  /* ----------------------- */

  let navItems = [];

  /* AUTHENTICATED USERS */

  if (freelancerAuthenticated && freelancerUser) {
    navItems = getAuthNavItems(freelancerUser, "freelancer");
  } else if (clientAuthenticated && clientUser) {
    navItems = getAuthNavItems(clientUser, "client");
  } else {
    /* PUBLIC USERS (NOT LOGGED IN) */
    navItems = [
      { to: "/projects", label: "Find Projects", icon: <FiSearch /> },
      { to: "/hire-freelancer", label: "I'm a Client", icon: <FiUser /> },
      { to: "/freelancer", label: "I'm a Freelancer", icon: <FiUser /> },
    ];
  }

  /* ----------------------- */
  /* Header UI */
  /* ----------------------- */
  return (
    <>
      <header
        className={`sticky top-0 z-[5000] transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-md py-2"
            : "backdrop-blur-md bg-white/40 py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 sm:mx-10">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl text-blue-600 font-bold backdrop-blur-md bg-white/50 border border-white/40 shadow-sm">
              LS
            </div>
            <span className="font-semibold text-gray-700 text-lg">
              LocalSkill
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center w-full">
            {/* SEARCH BAR */}
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center bg-white/70 backdrop-blur-md rounded-4xl px-4 py-2 shadow-sm">
                <FiSearch className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search projects, skills, categories..."
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
            {/* RIGHT ICONS */}
            <div
              className="flex items-center gap-3 ml-auto relative"
              ref={dropdownRef}
            >
              {/* 🔍 Quick Action Menu */}
              {(freelancerAuthenticated || clientAuthenticated) && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === "quick" ? null : "quick",
                      )
                    }
                    className={linkBase + " " + hoverStyle}
                  >
                    <FiCompass size={18} />
                  </button>

                  {/* DROPDOWN */}
                  {activeDropdown === "quick" && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[2000]">
                      {/* CLIENT → Find Freelancer */}
                      {clientAuthenticated && (
                        <button
                          onClick={() => {
                            setActiveDropdown(null);
                            navigate("/find-freelancers"); // create later
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Find Freelancer
                        </button>
                      )}

                      {/* FREELANCER → Find Projects */}
                      {freelancerAuthenticated && (
                        <button
                          onClick={() => {
                            setActiveDropdown(null);
                            navigate("/projects");
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Find Projects
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* 🔔 Notification */}
              {(freelancerAuthenticated || clientAuthenticated) && (
                <div className={linkBase + " " + hoverStyle}>
                  <NotificationBell />
                </div>
              )}

              {/* 💬 Messages */}
              {(freelancerAuthenticated || clientAuthenticated) && (
                <button className={linkBase + " " + hoverStyle}>
                  <FiMessageCircle size={18} />
                </button>
              )}

              {/* 👤 Profile Dropdown */}
              {(freelancerAuthenticated || clientAuthenticated) && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === "profile" ? null : "profile",
                      )
                    }
                    className={linkBase + " " + hoverStyle}
                  >
                    <FiUser size={18} />
                  </button>

                  {/* DROPDOWN */}
                  {activeDropdown === "profile" && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[2000]">
                      {/* Dashboard */}
                      <Link
                        to={
                          freelancerAuthenticated
                            ? `/freelancer/${freelancerUser.username}/dashboard`
                            : `/hire-freelancer/${clientUser.username}/dashboard`
                        }
                        className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Dashboard
                      </Link>

                      {/* My Projects */}
                      <Link
                        to={
                          freelancerAuthenticated
                            ? `/freelancer/${freelancerUser.username}/my-projects`
                            : `/hire-freelancer/${clientUser.username}/projects`
                        }
                        className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setActiveDropdown(null)}
                      >
                        My Projects
                      </Link>

                      {/* Profile */}
                      <Link
                        to={
                          freelancerAuthenticated
                            ? `/freelancer/${freelancerUser.username}`
                            : `/hire-freelancer/${clientUser.username}/profile`
                        }
                        className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setActiveDropdown(null)}
                      >
                        My Profile
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Logout */}
              {freelancerAuthenticated && (
                <button onClick={logoutFreelancer} className={logoutButton}>
                  <FiLogOut /> Logout
                </button>
              )}

              {clientAuthenticated && (
                <button onClick={logoutClient} className={logoutButton}>
                  <FiLogOut /> Logout
                </button>
              )}

              {/* Sign Up */}
              {!freelancerAuthenticated && isFreelancerRoute && (
                <Link to="/freelancer/signup" className={freelancerButton}>
                  Join as Freelancer
                </Link>
              )}

              {!clientAuthenticated && isClientRoute && (
                <Link to="/hire-freelancer/signup" className={primaryButton}>
                  Join as Client
                </Link>
              )}
            </div>
          </nav>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden p-2 rounded-xl shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed inset-0 z-[999] md:hidden ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`fixed top-0 right-0 z-[900] bottom-0 h-screen w-[80%] max-w-xs bg-white/95 backdrop-blur-xl shadow-xl p-5 flex flex-col transform transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* TOP SECTION */}

          {/* Header */}
          {/* <div className="flex items-center justify-between mb-6">
            <button onClick={() => setMenuOpen(false)}>
              <FiX size={22} />
            </button>
          </div> */}

          {/* Navigation */}
          <div className="flex flex-col gap-8 mt-25">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={linkClass(item.to)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* BOTTOM SECTION */}
          <div className="mt-auto pt-3 border-t border-gray-200">
            {/* Notification */}
            {(freelancerAuthenticated || clientAuthenticated) && (
              <button
                onClick={() => {
                  setMenuOpen(false);

                  if (freelancerUser) {
                    navigate(
                      `/freelancer/${freelancerUser.username}/notifications`,
                    );
                  } else if (clientUser) {
                    navigate(
                      `/hire-freelancer/${clientUser.username}/notifications`,
                    );
                  }
                }}
                className={`${linkBase} ${hoverStyle} w-full flex items-center justify-center my-5`}
              >
                <div className="flex items-center gap-2">
                  <FiBell />
                  <span>Notifications</span>
                </div>
              </button>
            )}
            {freelancerAuthenticated && (
              <button
                onClick={logoutFreelancer}
                className={`${logoutButton} w-full justify-center`}
              >
                <FiLogOut /> Logout
              </button>
            )}

            {clientAuthenticated && (
              <button
                onClick={logoutClient}
                className={`${logoutButton} w-full justify-center `}
              >
                <FiLogOut />
                <span className="">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
