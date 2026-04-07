import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useClientAuth } from "../context/client/useClientAuth";

export default function CommonProtectedRoute({ children }) {
  const { isAuthenticated: freelancerAuth, loading: freelancerLoading } =
    useAuth();
  const { isAuthenticated: clientAuth, loading: clientLoading } =
    useClientAuth();

  if (freelancerLoading || clientLoading) {
    return <p>Loading...</p>;
  }

  if (!freelancerAuth && !clientAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
}
