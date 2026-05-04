import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useClientAuth } from "../context/client/useClientAuth";
import { useTheme } from "../context/useTheme";
import useNotifications from "../hooks/useNotifications";

import NotificationBell from "../components/NotificationBell";
import MessageBadge from "../components/MessageBadge";

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
  FiHeart,
  FiDollarSign,
} from "react-icons/fi";
import { RiMoonFill, RiSunFill } from "react-icons/ri";

export default function Header() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount: notificationCount } = useNotifications();
  const [menuOpen,       setMenuOpen      ] = useState(false);
  const [scrolled,       setScrolled      ] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

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

  const path            = location.pathname;
  const isFreelancerRoute = path.startsWith("/freelancer");
  const isClientRoute     = path.startsWith("/hire-freelancer");

  // ── Scroll shadow ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Click outside closes dropdown ─────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Escape key closes dropdown ─────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  if (freelancerLoading) return null;

  /* ── Style tokens ─────────────────────────────────────────────────────── */
  const linkBase =
    "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all dark-nav-link";

  const activeStyle =
    "text-blue-600 dark:text-blue-400 shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1e293b,inset_-3px_-3px_6px_#334155]";

  const logoutButton =
    "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-red-500 bg-red-50/60 backdrop-blur border border-red-200/60 hover:bg-red-100/70 hover:text-red-600 transition-all duration-200 dark:bg-red-900/30 dark:border-red-800/60 dark:hover:bg-red-900/50";
  const primaryButton =
    "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-blue-600 bg-blue-50/60 backdrop-blur border border-blue-200/60 hover:bg-blue-100/70 hover:text-blue-700 transition-all duration-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800/60 dark:hover:bg-blue-900/50";
  const freelancerButton =
    "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-emerald-600 bg-emerald-50/60 backdrop-blur border border-emerald-200/60 hover:bg-emerald-100/70 hover:text-emerald-700 transition-all duration-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800/60 dark:hover:bg-emerald-900/50";

  const isActive   = (route) => location.pathname.startsWith(route);
  const linkClass  = (route) => `${linkBase} ${isActive(route) ? activeStyle : ""}`;

  /* ── Logout handlers ──────────────────────────────────────────────────── */
  const logoutFreelancer = async () => {
    await freelancerLogout();
    navigate("/freelancer/login");
  };

  const logoutClient = async () => {
    await clientLogout();
    navigate("/hire-freelancer/login");
  };

  /* ── Nav items helper ─────────────────────────────────────────────────── */
  const getAuthNavItems = (user, role) => {
    if (!user) return [];

    if (role === "freelancer") {
      return [
        { to: "/projects",                                  label: "Find Projects", icon: <FiSearch size={18} /> },
        { to: `/freelancer/${user.username}/dashboard`,     label: "Dashboard",     icon: <FiGrid size={18} /> },
        { to: `/freelancer/${user.username}/my-projects`,   label: "My Works",      icon: <FiFolder size={18} /> },
        { to: `/freelancer/${user.username}/earnings`,      label: "My Earnings",   icon: <FiDollarSign size={18} /> },
        { to: `/freelancer/${user.username}`,               label: "My Profile",    icon: <FiUser size={18} /> },
        { to: `/freelancer/${user.username}/saved-projects`,label: "Saved",         icon: <FiHeart size={18} /> },
      ];
    }

    if (role === "client") {
      return [
        { to: "/find-freelancers",                                    label: "Find Freelancers", icon: <FiSearch size={18} /> },
        { to: `/hire-freelancer/${user.username}/dashboard`,          label: "Dashboard",        icon: <FiGrid size={18} /> },
        { to: `/hire-freelancer/${user.username}/projects`,           label: "My Projects",      icon: <FiFolder size={18} /> },
        { to: `/hire-freelancer/${user.username}/profile`,            label: "My Profile",       icon: <FiUser size={18} /> },
        { to: `/hire-freelancer/${user.username}/saved-freelancer`,   label: "Saved",            icon: <FiHeart size={18} /> },
      ];
    }

    return [];
  };

  /* ── Navigation items ─────────────────────────────────────────────────── */
  let navItems = [];

  if (freelancerAuthenticated && freelancerUser) {
    navItems = getAuthNavItems(freelancerUser, "freelancer");
  } else if (clientAuthenticated && clientUser) {
    navItems = getAuthNavItems(clientUser, "client");
  } else {
    navItems = [
      { to: "/projects",        label: "Find Projects",  icon: <FiSearch size={18} /> },
      { to: "/hire-freelancer", label: "I'm a Client",   icon: <FiUser size={18} /> },
      { to: "/freelancer",      label: "I'm a Freelancer", icon: <FiUser size={18} /> },
    ];
  }

  const isAnyAuthenticated = freelancerAuthenticated || clientAuthenticated;

  /* ── Saved-page link helper ───────────────────────────────────────────── */
  const savedTo = freelancerAuthenticated && freelancerUser
    ? `/freelancer/${freelancerUser.username}/saved-projects`
    : clientAuthenticated && clientUser
      ? `/hire-freelancer/${clientUser.username}/saved-freelancer`
      : "#";

  /* ── Messages link helper ───────────────────────────────────────────── */
  const messagesTo = freelancerAuthenticated && freelancerUser
    ? `/freelancer/${freelancerUser.username}/messages`
    : clientAuthenticated && clientUser
      ? `/hire-freelancer/${clientUser.username}/messages`
      : "#";

  /* ── Dashboard & profile link helpers ────────────────────────────────── */
  const dashboardTo = freelancerAuthenticated
    ? `/freelancer/${freelancerUser.username}/dashboard`
    : `/hire-freelancer/${clientUser?.username}/dashboard`;

  const projectsTo = freelancerAuthenticated
    ? `/freelancer/${freelancerUser.username}/my-projects`
    : `/hire-freelancer/${clientUser?.username}/projects`;

  const profileTo = freelancerAuthenticated
    ? `/freelancer/${freelancerUser.username}`
    : `/hire-freelancer/${clientUser?.username}/profile`;

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <>
      <header
        className={`sticky top-0 z-[5000] transition-shadow duration-300 ${
          scrolled
            ? "bg-white dark:bg-slate-900 md:backdrop-blur-xl md:bg-white/70 md:dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700/50 shadow-md py-2"
            : "bg-white dark:bg-slate-900 md:backdrop-blur-md md:bg-white/40 md:dark:bg-slate-900/60 py-2"
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 sm:mx-10" aria-label="LocalSkill home">
            <div
              className="w-10 h-10 flex items-center justify-center rounded-xl text-blue-600 font-bold backdrop-blur-md bg-white/50 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/60 shadow-sm"
              aria-hidden="true"
            >
              LS
            </div>
            <span className="font-semibold text-gray-700 dark:text-slate-200 text-lg">LocalSkill</span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center w-full" aria-label="Main navigation">

            {/* SEARCH BAR */}
            <div className="flex-1 max-w-2xl mr-10">
              <label htmlFor="site-search" className="sr-only">
                Search projects, skills, categories
              </label>
              <div className="flex items-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-4xl px-4 py-2 shadow-sm">
                <FiSearch className="text-gray-500 dark:text-slate-400 mr-2" aria-hidden="true" />
                <input
                  id="site-search"
                  type="search"
                  placeholder="Search projects, skills, categories…"
                  className="w-full bg-transparent outline-none text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
                  aria-label="Search projects, skills, categories"
                />
              </div>
            </div>

            {/* RIGHT ICONS */}
            <div className="flex items-center gap-3 ml-auto relative" ref={dropdownRef}>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={`${linkBase} text-slate-600 dark:text-amber-400`}
              >
                {isDark
                  ? <RiSunFill size={18} aria-hidden="true" />
                  : <RiMoonFill size={18} aria-hidden="true" />
                }
              </button>

              {/* Quick Action (compass) */}
              {isAnyAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(activeDropdown === "quick" ? null : "quick")
                    }
                    className={linkBase}
                    aria-label="Quick actions"
                    aria-expanded={activeDropdown === "quick"}
                    aria-haspopup="menu"
                  >
                    <FiCompass size={18} aria-hidden="true" />
                  </button>

                  {activeDropdown === "quick" && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-[2000]"
                    >
                      {clientAuthenticated && (
                        <button
                          role="menuitem"
                          onClick={() => { setActiveDropdown(null); navigate("/find-freelancers"); }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          Find Freelancer
                        </button>
                      )}
                      {freelancerAuthenticated && (
                        <button
                          role="menuitem"
                          onClick={() => { setActiveDropdown(null); navigate("/projects"); }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          Find Projects
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Saved / Bookmark */}
              {isAnyAuthenticated && (
                <Link to={savedTo} aria-label="Saved items" className={linkBase}>
                  <FiHeart size={18} aria-hidden="true" />
                </Link>
              )}

              {/* Notification Bell */}
              {isAnyAuthenticated && (
                <NotificationBell className={linkBase} />
              )}

              {/* Messages */}
              {isAnyAuthenticated && (
                <Link to={messagesTo} className={`${linkBase} relative`} aria-label="Messages">
                  <FiMessageCircle size={18} aria-hidden="true" />
                  <MessageBadge />
                </Link>
              )}

              {/* Profile Dropdown */}
              {isAnyAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(activeDropdown === "profile" ? null : "profile")
                    }
                    className={linkBase}
                    aria-label="Profile menu"
                    aria-expanded={activeDropdown === "profile"}
                    aria-haspopup="menu"
                  >
                    <FiUser size={18} aria-hidden="true" />
                  </button>

                  {activeDropdown === "profile" && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-[2000]"
                    >
                      <Link
                        role="menuitem"
                        to={dashboardTo}
                        className="block px-4 py-2 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        role="menuitem"
                        to={projectsTo}
                        className="block px-4 py-2 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        onClick={() => setActiveDropdown(null)}
                      >
                        My Projects
                      </Link>
                      <Link
                        role="menuitem"
                        to={profileTo}
                        className="block px-4 py-2 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
                <button onClick={logoutFreelancer} className={logoutButton} aria-label="Log out">
                  <FiLogOut size={18} aria-hidden="true" /> Logout
                </button>
              )}
              {clientAuthenticated && (
                <button onClick={logoutClient} className={logoutButton} aria-label="Log out">
                  <FiLogOut size={18} aria-hidden="true" /> Logout
                </button>
              )}

              {/* Sign Up CTAs */}
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

          {/* MOBILE ACTIONS */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              className="p-2.5 rounded-xl shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff] dark:shadow-[4px_4px_10px_#0f172a,-4px_-4px_10px_#1e293b] dark:text-slate-200 dark:bg-slate-800/60"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <FiX size={22} aria-hidden="true" /> : <FiMenu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[999] md:hidden ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar */}
        <nav
          className={`fixed top-0 right-0 z-[900] bottom-0 h-screen w-[80%] max-w-xs bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl p-5 flex flex-col transform transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label="Mobile navigation"
        >
          {/* Navigation links */}
          <div className="flex flex-col gap-4 mt-25">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={linkClass(item.to)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-3 border-t border-gray-200 dark:border-slate-700">
            {/* Messages (Mobile) */}
            {isAnyAuthenticated && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate(messagesTo);
                }}
                className={`${linkBase} w-full flex items-center justify-between mt-3`}
                aria-label="View messages"
              >
                <div className="flex items-center gap-3">
                  <FiMessageCircle size={18} aria-hidden="true" />
                  <span className="text-sm font-semibold">Messages</span>
                </div>
                <MessageBadge variant="inline" />
              </button>
            )}

            {/* Notifications */}
            {isAnyAuthenticated && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  const notifPath = freelancerUser
                    ? `/freelancer/${freelancerUser.username}/notifications`
                    : `/hire-freelancer/${clientUser.username}/notifications`;
                  navigate(notifPath);
                }}
                className={`${linkBase} w-full flex items-center justify-between my-2`}
                aria-label="View notifications"
              >
                <div className="flex items-center gap-3">
                  <FiBell size={18} aria-hidden="true" />
                  <span className="text-sm font-semibold">Notifications</span>
                </div>
                {notificationCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Theme Toggle (Mobile Sidebar) */}
            <button
              onClick={toggleTheme}
              className={`${linkBase} w-full flex items-center justify-start my-2 text-slate-600 dark:text-amber-400`}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <div className="flex items-center gap-3">
                  <RiSunFill size={18} aria-hidden="true" />
                  <span className="text-sm font-semibold">Light Mode</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <RiMoonFill size={18} aria-hidden="true" />
                  <span className="text-sm font-semibold">Dark Mode</span>
                </div>
              )}
            </button>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800/50">
              {freelancerAuthenticated && (
                <button
                  onClick={logoutFreelancer}
                  className={`${logoutButton} w-full justify-start gap-3`}
                  aria-label="Log out"
                >
                  <FiLogOut size={18} aria-hidden="true" />
                  <span className="text-sm font-semibold">Logout</span>
                </button>
              )}

              {clientAuthenticated && (
                <button
                  onClick={logoutClient}
                  className={`${logoutButton} w-full justify-start gap-3`}
                  aria-label="Log out"
                >
                  <FiLogOut size={18} aria-hidden="true" />
                  <span className="text-sm font-semibold">Logout</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
