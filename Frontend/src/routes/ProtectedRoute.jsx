import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Still checking auth status
  if (loading) {
    return <p>Loading...</p>;
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/freelancer/login" replace />;
  }

  // Authenticated
  return children;
}
