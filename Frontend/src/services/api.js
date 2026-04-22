import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
// Attach the correct auth token based on which role is logged in or which route is active.
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const currentPath = window.location.pathname || "";
    let token = null;

    if (url.includes("/control-center") || currentPath.startsWith("/control-center")) {
      token = localStorage.getItem("admin_token");
    } else if (url.includes("/hire-freelancer") || currentPath.startsWith("/client") || currentPath.startsWith("/hire-freelancer")) {
      token = localStorage.getItem("client_token");
    } else if (url.includes("/freelancer") || currentPath.startsWith("/freelancer")) {
      token = localStorage.getItem("freelancer_token");
    } else {
      token =
        localStorage.getItem("freelancer_token") ||
        localStorage.getItem("client_token") ||
        localStorage.getItem("admin_token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// On 401 clear the matching role's stored credentials.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";

      if (url.includes("/freelancer")) {
        localStorage.removeItem("freelancer_token");
        localStorage.removeItem("freelancer_user");
      } else if (url.includes("/hire-freelancer")) {
        localStorage.removeItem("client_token");
        localStorage.removeItem("client_user");
      } else if (url.includes("/control-center")) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
