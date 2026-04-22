import { Navigate, useParams } from "react-router-dom";
import { useClientAuth } from "../context/client/useClientAuth";

export default function ClientProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useClientAuth();

  const { username } = useParams();

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="w-10 h-10 border-4 border-gray-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div></div>;

  if (!isAuthenticated) {
    return <Navigate to="/hire-freelancer/login" replace />;
  }

  // Wrong role
  if (user.role !== "client") {
    return <Navigate to="/" replace />;
  }

  // 🔥 Username mismatch protection
  if (username !== user.username) {
    return (
      <Navigate to={`/hire-freelancer/${user.username}/dashboard`} replace />
    );
  }
  if (!user) return <Navigate to="/hire-freelancer/login" replace />;

  // Prevent accessing another user's URL
  if (user && username !== user.username) {
    return (
      <Navigate to={`/hire-freelancer/${user.username}/dashboard`} replace />
    );
  }

  // if (!isProfileCompleted) {
  //   return <Navigate to={`/hire-freelancer/${username}/profile`} replace />;
  // }

  return children;
}
