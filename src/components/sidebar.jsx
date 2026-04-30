import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../config/supabase";

export default function Sidebar() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };
    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isTutor = profile && profile.role === "tutor";
  const accent = "#5c6bc0";

  const navLinks = [
    { to: "/dashboard", icon: "🏠", label: "Dashboard" },
    { to: "/progress", icon: "📊", label: "Progress" },

    { to: "/students", icon: "👨‍🎓", label: "Students" },
    { to: "/modules", icon: "📚", label: "Modules" },
    { to: "/assignments", icon: "📝", label: "Assignments" },
    { to: "/quiz", icon: "🧠", label: "Quizzes" },
    { to: "/timetable", icon: "📅", label: "Timetable" },
    { to: "/meeting", icon: "🎥", label: "Video Meeting" },
    { to: "/chat", icon: "💬", label: "Messages" },
    { to: "/announcements", icon: "📢", label: "Notices" },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>📖</div>
        <div>
          <h1 style={styles.logoText}>LearnHub</h1>
          <p style={styles.logoSub}>VLE Portal</p>
        </div>
      </div>

      {profile && (
        <div style={styles.profileSection}>
          <div style={styles.profileAvatar}>
            {profile.full_name && profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div style={styles.profileInfo}>
            <p style={styles.profileName}>{profile.full_name}</p>
            <p style={styles.profileRole}>
              {isTutor ? "👩‍🏫 Tutor" : `👨‍🎓 Student • Grade ${profile.grade}`}
            </p>
          </div>
        </div>
      )}

      <div style={styles.navSection}>
        <p style={styles.navLabel}>
          {isTutor ? "TUTOR PORTAL" : "STUDENT PORTAL"}
        </p>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.navLink,
                background: isActive ? "#ede7f6" : "transparent",
                color: isActive ? accent : "#4a5568",
                fontWeight: isActive ? "600" : "400",
                borderLeft: isActive
                  ? `3px solid ${accent}`
                  : "3px solid transparent",
              }}
            >
              <span style={styles.navIcon}>{link.icon}</span>
              <span>{link.label}</span>
              {isActive && <span style={styles.activeIndicator} />}
            </Link>
          );
        })}
      </div>

      <div style={styles.bottomSection}>
        <div style={styles.helpBox}>
          <p style={styles.helpTitle}>Need help? 💡</p>
          <p style={styles.helpText}>
            Contact your {isTutor ? "admin" : "tutor"} for support
          </p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    height: "100vh",
    background: "white",
    borderRight: "1px solid #e8eaf6",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 100,
    boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "24px 20px",
    borderBottom: "1px solid #f0f0f0",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    background: "#ede7f6",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a1a2e",
    lineHeight: 1,
  },
  logoSub: {
    fontSize: "11px",
    color: "#9e9e9e",
    marginTop: "2px",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    background: "#f8f9ff",
    margin: "12px",
    borderRadius: "12px",
  },
  profileAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#5c6bc0",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },
  profileInfo: { flex: 1, overflow: "hidden" },
  profileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a2e",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  profileRole: { fontSize: "11px", color: "#7986cb", marginTop: "2px" },
  navSection: { flex: 1, padding: "8px 12px", overflowY: "auto" },
  navLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#b0bec5",
    letterSpacing: "1px",
    padding: "12px 8px 8px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "2px",
    transition: "all 0.15s",
    textDecoration: "none",
  },
  navIcon: { fontSize: "16px", width: "20px", textAlign: "center" },
  activeIndicator: {
    marginLeft: "auto",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#5c6bc0",
  },
  bottomSection: { padding: "12px", borderTop: "1px solid #f0f0f0" },
  helpBox: {
    background: "#f3e5f5",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "10px",
  },
  helpTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6a1b9a",
    marginBottom: "4px",
  },
  helpText: { fontSize: "11px", color: "#9c27b0" },
  logoutBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px",
    background: "#fff5f5",
    color: "#e53e3e",
    border: "1px solid #fed7d7",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};
