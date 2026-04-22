import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useClientAuth } from "../context/client/useClientAuth";

export default function CommonProtectedRoute({ children }) {
  const { isAuthenticated: freelancerAuth, loading: freelancerLoading } =
    useAuth();
  const { isAuthenticated: clientAuth, loading: clientLoading } =
    useClientAuth();

  if (freelancerLoading || clientLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="w-10 h-10 border-4 border-gray-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div></div>;
  }

  if (!freelancerAuth && !clientAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
}
