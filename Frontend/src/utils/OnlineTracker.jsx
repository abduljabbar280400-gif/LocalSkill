import { useEffect } from "react";
import api from "../services/api";

/**
 * OnlineTracker
 * Mounts at the app root to handle the user's online status.
 */
function OnlineTracker() {
  useEffect(() => {
    let active = true;

    // 1. Tell the server we are online as soon as we load/refresh
    api.post("/chat/global-online").catch(() => {});

    // 2. Heartbeat every 60 seconds to keep presence fresh
    const heartbeat = setInterval(() => {
      if (!active) return;
      api.post("/user/heartbeat").catch((err) => {
        if (err.response?.status === 401) clearInterval(heartbeat);
      });
    }, 60000);

    // 3. Handle tab close / browser close using sendBeacon
    const handleUnload = () => {
      const token =
        localStorage.getItem("client_token") ||
        localStorage.getItem("freelancer_token") ||
        "";
      
      if (token) {
        // navigator.sendBeacon is more reliable for page closures
        const url = `${import.meta.env.VITE_API_BASE_URL}/chat/global-offline-beacon`;
        const data = new FormData();
        data.append("_token", token);
        navigator.sendBeacon(url, data);
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      active = false;
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return null;
}

export default OnlineTracker;
