import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import ClientAuthContext from "./clientAuthContext";

// Lazy-load echo to keep pusher-js (~100KB) off the critical path
const lazyResetEcho = () => import("../../utils/echo").then((m) => m.resetEcho());

export default function ClientAuthProvider({ children }) {
  const storedUser       = localStorage.getItem("client_user");
  const storedProfile    = localStorage.getItem("client_profile");
  const storedCompletion = localStorage.getItem("client_profile_completed");

  const [user, setUser] = useState(
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null,
  );

  const [profile, setProfile] = useState(
    storedProfile && storedProfile !== "undefined"
      ? JSON.parse(storedProfile)
      : null,
  );

  const [isProfileCompleted, setIsProfileCompleted] = useState(
    storedCompletion === "true",
  );

  const [token,   setToken  ] = useState(localStorage.getItem("client_token"));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // ── Clear all auth state ─────────────────────────────────────────────────
  const clearAuth = () => {
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    localStorage.removeItem("client_profile");
    localStorage.removeItem("client_profile_completed");
    setUser(null);
    setProfile(null);
    setIsProfileCompleted(false);
    setToken(null);
    // Reconnect Echo without the old token
    lazyResetEcho();
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // Prioritize the actual logout call which updates the DB status
      await api.post("/hire-freelancer/logout");
    } catch (error) {
      console.warn("Client logout API error:", error.response?.data ?? error);
    } finally {
      clearAuth();
    }
  }, []);

  // ── Fetch logged-in client ───────────────────────────────────────────────
  const fetchMe = useCallback(async () => {
    try {
      const response                           = await api.get("/hire-freelancer/me");
      const { user, profile, is_profile_completed } = response.data;

      setUser(user);
      setProfile(profile);
      setIsProfileCompleted(is_profile_completed);

      localStorage.setItem("client_user",              JSON.stringify(user));
      localStorage.setItem("client_profile",           JSON.stringify(profile));
      localStorage.setItem("client_profile_completed", is_profile_completed);
    } catch (error) {
      console.error("fetchMe (client):", error);
      if (error.response?.status === 401) {
        clearAuth();
      }
    }
  }, []);

  // ── Bootstrap on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (token) {
      fetchMe().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchMe]);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const response = await api.post("/hire-freelancer/login", credentials);

    const accessToken = response.data.access_token;
    localStorage.setItem("client_token", accessToken);
    setToken(accessToken);

    // Re-create Echo so WebSocket auth uses the new token
    lazyResetEcho();

    const meResponse                                   = await api.get("/hire-freelancer/me");
    const { user, profile, is_profile_completed }      = meResponse.data;

    setUser(user);
    setProfile(profile);
    setIsProfileCompleted(is_profile_completed);

    localStorage.setItem("client_user",              JSON.stringify(user));
    localStorage.setItem("client_profile",           JSON.stringify(profile));
    localStorage.setItem("client_profile_completed", is_profile_completed);

    return user;
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (data) => {
    try {
      const response    = await api.post("/hire-freelancer/register", data);
      const accessToken = response.data.access_token;

      localStorage.setItem("client_token", accessToken);
      setToken(accessToken);

      // Re-create Echo so WebSocket auth uses the new token
      lazyResetEcho();

      const user = response.data.user;
      localStorage.setItem("client_user", JSON.stringify(user));
      setUser(user);

      return user;
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  };

  // ── Refresh user/profile ─────────────────────────────────────────────────
  const refreshUser = async () => {
    if (!token) return;
    try {
      const response                                = await api.get("/hire-freelancer/me");
      const { user, profile, is_profile_completed } = response.data;

      setUser(user);
      setProfile(profile);
      setIsProfileCompleted(is_profile_completed);

      localStorage.setItem("client_user",              JSON.stringify(user));
      localStorage.setItem("client_profile",           JSON.stringify(profile));
      localStorage.setItem("client_profile_completed", is_profile_completed);
    } catch (error) {
      console.error("refreshUser failed:", error);
      clearAuth();
    }
  };

  return (
    <ClientAuthContext.Provider
      value={{
        user,
        profile,
        isProfileCompleted,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}
