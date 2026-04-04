import { useEffect } from "react";
import api from "../../src/services/api";

function OnlineTracker() {
  useEffect(() => {
    const updateLastSeen = async () => {
      try {
        await api.post("/chat/last-seen");
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn("Unauthorized — stopping tracker");
          clearInterval(interval);
        }
      }
    };

    // immediate update
    updateLastSeen();

    const interval = setInterval(updateLastSeen, 25000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

export default OnlineTracker;
