import { useEffect, useState } from "react";
import api from "../services/api";

export default function useAvailabilityCheck(url, paramName, value) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value) {
      setStatus(null);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `${url}?${paramName}=${encodeURIComponent(value)}`
        );

        setStatus(res.data.available);
      } catch {
        setStatus(null);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [value, url, paramName]);

  return { status, loading };
}