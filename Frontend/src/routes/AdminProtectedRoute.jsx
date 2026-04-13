import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("admin_token");
  const user = JSON.parse(localStorage.getItem("admin_user"));

  if (!token || user?.role !== "admin") {
    return <Navigate to="/cc/inter/admin/login" />;
  }

  return children;
}
