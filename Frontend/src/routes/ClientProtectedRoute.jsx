import { Navigate, useParams } from "react-router-dom";
import { useClientAuth } from "../context/client/useClientAuth";

export default function ClientProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useClientAuth();

  const { username } = useParams();

  if (loading) return <p>Loading...</p>;

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
