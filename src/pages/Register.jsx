import React, { useState } from "react";
import { supabase } from "../config/supabase";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function Register() {
  const { role } = useParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isTutor = role === "tutor";

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      role,
      grade: isTutor ? null : grade,
    });
    navigate("/dashboard");
    setLoading(false);
  };

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
          Join
          <br />
          <span style={styles.highlight}>LearnHub VLE</span>
          <br />
          today
        </h2>
        <p style={styles.desc}>
          Create your {isTutor ? "tutor" : "student"} account to get started
          with the UK's leading virtual learning environment.
        </p>
        <button
          style={styles.backBtn}
          onClick={() => navigate(`/login/${role}`)}
        >
          ← Back to login
        </button>
      </div>

      <div style={styles.right}>
        <div style={styles.registerBox}>
          <div style={styles.roleTag}>
            <span style={{ fontSize: "24px" }}>{isTutor ? "👩‍🏫" : "👨‍🎓"}</span>
            <span
              style={{
                ...styles.roleLabel,
                color: isTutor ? "#5c6bc0" : "#3f51b5",
              }}
            >
              {isTutor ? "Tutor Registration" : "Student Registration"}
            </span>
          </div>

          <h2 style={styles.title}>Create account</h2>
          <p style={styles.subtitle}>Fill in your details to get started</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleRegister}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <label style={styles.label}>Email address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {!isTutor && (
              <>
                <label style={styles.label}>Your Grade</label>
                <select
                  style={styles.input}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </>
            )}
            <button
              style={{
                ...styles.button,
                background: isTutor ? "#5c6bc0" : "#3f51b5",
              }}
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : `Register as ${isTutor ? "Tutor" : "Student"}`}
            </button>
          </form>

          <p style={styles.link}>
            Already have an account?{" "}
            <Link
              to={`/login/${role}`}
              style={{ color: "#5c6bc0", fontWeight: "600" }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", background: "#f0f2f5" },
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
    width: "48px",
    height: "48px",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "800",
    color: "white",
    lineHeight: 1,
  },
  logoSub: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
    marginTop: "2px",
  },
  headline: {
    fontSize: "40px",
    fontWeight: "800",
    color: "white",
    lineHeight: 1.2,
    marginBottom: "20px",
  },
  highlight: { color: "#90caf9" },
  desc: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.7,
    marginBottom: "32px",
    maxWidth: "380px",
  },
  backBtn: {
    background: "rgba(255,255,255,0.1)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    width: "fit-content",
  },
  right: {
    width: "480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  registerBox: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
  },
  roleTag: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "24px",
    padding: "10px 16px",
    background: "#f8f9ff",
    borderRadius: "10px",
  },
  roleLabel: { fontSize: "15px", fontWeight: "700" },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "6px",
  },
  subtitle: { fontSize: "14px", color: "#888", marginBottom: "28px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "13px 16px",
    marginBottom: "20px",
    borderRadius: "10px",
    border: "1.5px solid #e0e0e0",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "4px",
  },
  error: {
    background: "#ffebee",
    color: "#c62828",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  link: {
    textAlign: "center",
    marginTop: "24px",
    color: "#888",
    fontSize: "14px",
  },
};
