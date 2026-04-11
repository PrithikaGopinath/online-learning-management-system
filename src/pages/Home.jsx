import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.logoRow}>
          <div style={styles.logoBox}>📖</div>
          <div>
            <h1 style={styles.logoText}>LearnHub VLE</h1>
            <p style={styles.logoSub}>Virtual Learning Environment</p>
          </div>
        </div>
        <h2 style={styles.headline}>
          Your complete
          <br />
          <span style={styles.highlight}>learning platform</span>
          <br />
          for Grades 1–12
        </h2>
        <p style={styles.desc}>
          Access your modules, submit assignments, take quizzes, join live
          classes and communicate with your tutors — all in one place.
        </p>
        <div style={styles.features}>
          {[
            "📚 UK Curriculum Modules",
            "📝 Assignment Submission",
            "🧠 Auto-graded Quizzes",
            "🎥 Live Video Classes",
            "💬 Real-time Messaging",
            "📅 Weekly Timetable",
          ].map((f) => (
            <div key={f} style={styles.feature}>
              {f}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.loginBox}>
          <h2 style={styles.loginTitle}>Sign in to your portal</h2>
          <p style={styles.loginSub}>Choose your role to continue</p>

          <div style={styles.roleCards}>
            <div
              style={styles.studentCard}
              onClick={() => navigate("/login/student")}
            >
              <div style={styles.roleIcon}>👨‍🎓</div>
              <h3 style={styles.roleTitle}>Student</h3>
              <p style={styles.roleDesc}>
                Access your learning materials and submit work
              </p>
              <div style={{ ...styles.roleBtn, background: "#3f51b5" }}>
                Student Login →
              </div>
            </div>

            <div
              style={styles.tutorCard}
              onClick={() => navigate("/login/tutor")}
            >
              <div style={styles.roleIcon}>👩‍🏫</div>
              <h3 style={styles.roleTitle}>Tutor</h3>
              <p style={styles.roleDesc}>
                Manage courses, set work and monitor students
              </p>
              <div style={{ ...styles.roleBtn, background: "#5c6bc0" }}>
                Tutor Login →
              </div>
            </div>
          </div>

          <div style={styles.infoRow}>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>🔒</span>
              <span style={styles.infoText}>Secure login</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>🇬🇧</span>
              <span style={styles.infoText}>UK Curriculum</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>📱</span>
              <span style={styles.infoText}>Any device</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    background: "#f0f2f5",
  },
  left: {
    flex: 1,
    background:
      "linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #5c6bc0 100%)",
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "48px",
  },
  logoBox: {
    width: "56px",
    height: "56px",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "800",
    color: "white",
    lineHeight: 1,
  },
  logoSub: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.6)",
    marginTop: "4px",
  },
  headline: {
    fontSize: "48px",
    fontWeight: "800",
    color: "white",
    lineHeight: 1.2,
    marginBottom: "24px",
  },
  highlight: {
    color: "#90caf9",
  },
  desc: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.7,
    marginBottom: "40px",
    maxWidth: "420px",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  feature: {
    background: "rgba(255,255,255,0.1)",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "white",
    fontWeight: "500",
  },
  right: {
    width: "480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  loginBox: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
  },
  loginTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  loginSub: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "32px",
  },
  roleCards: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "28px",
  },
  studentCard: {
    border: "2px solid #e8eaf6",
    borderRadius: "14px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  tutorCard: {
    border: "2px solid #e8eaf6",
    borderRadius: "14px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  roleIcon: { fontSize: "32px" },
  roleTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  roleDesc: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "8px",
  },
  roleBtn: {
    padding: "10px 16px",
    color: "white",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-around",
    paddingTop: "20px",
    borderTop: "1px solid #f0f0f0",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  infoIcon: { fontSize: "16px" },
  infoText: { fontSize: "12px", color: "#999" },
};
