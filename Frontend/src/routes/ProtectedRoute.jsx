import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Still checking auth status
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="w-10 h-10 border-4 border-gray-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div></div>;
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/freelancer/login" replace />;
  }

  // Authenticated
  return children;
}
