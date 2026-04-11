import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();

  // Wait until AuthContext finishes loading session + profile
  if (loading) return null;

  // If no user, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // If role still not loaded, block redirect until it loads
  if (!role) return null;

  // Normalize allowedRole into an array
  const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

  // If user's role is not allowed, redirect
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
