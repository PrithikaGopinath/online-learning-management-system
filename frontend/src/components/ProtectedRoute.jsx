import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
    const { user, role } = useAuth();

    // TEMPORARY BYPASS: allow if they haven't set up Supabase yet for demoing UI
    const isBypassMode = localStorage.getItem("temp_role") !== null;
    const tempRole = localStorage.getItem("temp_role");

    // If we are strictly checking Supabase Auth (and bypass is off)
    if (!isBypassMode && !user) {
        return <Navigate to="/" replace />;
    }

    const currentRole = isBypassMode ? tempRole : role;

    if (allowedRole && currentRole !== allowedRole) {
        // Redirect wrong roles to their correct dashboards
        if (currentRole === "tutor") return <Navigate to="/dashboard/tutor" replace />;
        return <Navigate to="/dashboard/student" replace />;
    }

    return children;
}
