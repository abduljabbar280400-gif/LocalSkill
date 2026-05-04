import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import AuthContext from "./authContext";

// Lazy-load echo to keep pusher-js (~100KB) off the critical path
const lazyResetEcho = () => import("../utils/echo").then((m) => m.resetEcho());

export default function AuthProvider({ children }) {
  const storedUser  = localStorage.getItem("freelancer_user");
  const storedToken = localStorage.getItem("freelancer_token");

  const [user, setUser] = useState(() => {
    if (!storedUser || storedUser === "undefined") return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("freelancer_user");
      return null;
    }
  });

  const [token,   setToken  ] = useState(storedToken);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;
  const location = useLocation();

  const clearAuth = () => {
    localStorage.removeItem("freelancer_token");
    localStorage.removeItem("freelancer_user");
    setUser(null);
    setToken(null);
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

    if (token && isFreelancerRoute) {
      fetchMe().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchMe, location.pathname]);

  const login = async (credentials) => {
    try {
      const response = await api.post("/freelancer/login", credentials);

      const accessToken = response.data.access_token;
      localStorage.setItem("freelancer_token", accessToken);
      setToken(accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // Re-create Echo so WebSocket auth uses the new token
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
      const response = await api.post("/freelancer/register", data);

      const accessToken = response.data.access_token;
      localStorage.setItem("freelancer_token", accessToken);
      setToken(accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // Re-create Echo so WebSocket auth uses the new token
      lazyResetEcho();

      const userData = await fetchMe();
      return userData;
    } catch (err) {
      return { error: err.response?.data?.message ?? "Registration failed" };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
