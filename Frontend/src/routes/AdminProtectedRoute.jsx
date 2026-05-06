import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("admin_user"));

  if (!user || user?.role !== "admin") {
    return <Navigate to="/cc/inter/admin/login" />;
  }

  return children;
}
