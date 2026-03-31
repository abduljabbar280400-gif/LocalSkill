import { useEffect } from "react";
import axios from "axios";

function OnlineTracker() {
  useEffect(() => {
    const token =
      localStorage.getItem("client_token") ||
      localStorage.getItem("freelancer_token");

    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    const updateLastSeen = async () => {
      try {
        await axios.post(
          "http://localhost:8000/api/chat/last-seen",
          {},
          { headers },
        );
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
