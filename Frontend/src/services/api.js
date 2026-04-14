import axios from "axios";

// Create Axios Instance
const api = axios.create({
  // baseURL: "https://localskill.onrender.com/api",
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // withCredentials: true,
  // timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);

// ================================
// ✅ REQUEST INTERCEPTOR (FIXED)
// ================================
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("admin_token") ||
      localStorage.getItem("client_token") ||
      localStorage.getItem("freelancer_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);



// ================================
// ✅ RESPONSE INTERCEPTOR (FIXED)
// ================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";

      if (url.includes("/freelancer")) {
        localStorage.removeItem("freelancer_token");
        localStorage.removeItem("freelancer_user");
      }

      if (url.includes("/hire-freelancer")) {
        localStorage.removeItem("client_token");
        localStorage.removeItem("client_user");
      }
      if (url.includes("/control-center")) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
