import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

const rootURL = import.meta.env.VITE_API_BASE_URL.endsWith("/api") 
  ? import.meta.env.VITE_API_BASE_URL.slice(0, -4) 
  : import.meta.env.VITE_API_BASE_URL;

const rootApi = axios.create({
  baseURL: rootURL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// Helper to get CSRF cookie
export const getCsrfToken = async () => {
  await rootApi.get("/sanctum/csrf-cookie");
};

// ── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Manual fail-safe for CSRF token sync on localhost
    if (typeof document !== "undefined") {
      const xsrfCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (xsrfCookie) {
        config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfCookie);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// On 401 clear the matching role's stored user info.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";

      if (url.includes("/freelancer")) {
        localStorage.removeItem("freelancer_user");
      } else if (url.includes("/hire-freelancer")) {
        localStorage.removeItem("client_user");
      } else if (url.includes("/control-center")) {
        localStorage.removeItem("admin_user");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
