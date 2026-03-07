import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/" replace />;

  if (role === null) return <Navigate to="/" replace />;

  const allowedRoles = Array.isArray(allowedRole)
    ? allowedRole
    : [allowedRole];

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
