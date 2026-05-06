import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api, { getCsrfToken } from "../services/api";
import AuthContext from "./authContext";

// Lazy-load echo to keep pusher-js (~100KB) off the critical path
const lazyResetEcho = () => import("../utils/echo").then((m) => m.resetEcho());

export default function AuthProvider({ children }) {
  const storedUser  = localStorage.getItem("freelancer_user");

  const [user, setUser] = useState(() => {
    if (!storedUser || storedUser === "undefined") return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("freelancer_user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const location = useLocation();

  const clearAuth = () => {
    localStorage.removeItem("freelancer_user");
    setUser(null);
    // Reconnect Echo with no token so stale auth is dropped
    lazyResetEcho();
  };

  const logout = useCallback(async () => {
    try {
      // Prioritize the actual logout call which updates the DB status
      await api.post("/freelancer/logout");
    } catch (error) {
      console.warn("Freelancer logout API error:", error.response?.data ?? error);
    } finally {
      clearAuth();
    }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const response = await api.get("/freelancer/me");
      const userData = response.data;
      setUser(userData);
      localStorage.setItem("freelancer_user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("fetchMe error:", error);
      if (error.response?.status === 401) {
        clearAuth();
      }
      return null;
    }
  }, []);

  useEffect(() => {
    const isFreelancerRoute = location.pathname.startsWith("/freelancer");

    // On mount or route change, we check if we're still authenticated via session
    if (isFreelancerRoute) {
      fetchMe().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchMe, location.pathname]);

  const login = async (credentials) => {
    try {
      // 1. Get CSRF cookie first
      await getCsrfToken();
      
      // 2. Perform login
      const response = await api.post("/freelancer/login", credentials);

      // Re-create Echo so WebSocket auth uses the new session
      lazyResetEcho();

      const userData = await fetchMe();
      return { userData };
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors?.email) {
        return { error: err.response.data.errors.email[0] };
      }
      return { error: err.response?.data?.message ?? "Login failed" };
    }
  };

  const register = async (data) => {
    try {
      // 1. Get CSRF cookie first
      await getCsrfToken();

      const response = await api.post("/freelancer/register", data);

      // Re-create Echo so WebSocket auth uses the new session
      lazyResetEcho();

      const userData = await fetchMe();
      return userData;
    } catch (err) {
      return { error: err.response?.data?.message ?? "Registration failed" };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
