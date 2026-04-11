import React, { useState } from "react";
import { supabase } from "../config/supabase";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function Login() {
  const { role } = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isTutor = role === "tutor";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (profile && profile.role !== role) {
      await supabase.auth.signOut();
      setError(
        `This is not a ${role} account. Please use the correct login page.`,
      );
      setLoading(false);
      return;
    }
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
          Welcome back to
          <br />
          <span style={styles.highlight}>LearnHub VLE</span>
        </h2>
        <p style={styles.desc}>
          Sign in to access your {isTutor ? "teaching" : "learning"} dashboard,
          {isTutor
            ? " manage your courses and students."
            : " view your modules and submit work."}
        </p>
        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ← Back to home
        </button>
      </div>

      <div style={styles.right}>
        <div style={styles.loginBox}>
          <div style={styles.roleTag}>
            <span style={{ fontSize: "24px" }}>{isTutor ? "👩‍🏫" : "👨‍🎓"}</span>
            <span
              style={{
                ...styles.roleLabel,
                color: isTutor ? "#5c6bc0" : "#3f51b5",
              }}
            >
              {isTutor ? "Tutor Portal" : "Student Portal"}
            </span>
          </div>

          <h2 style={styles.title}>Sign in</h2>
          <p style={styles.subtitle}>Enter your credentials to continue</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              style={{
                ...styles.button,
                background: isTutor ? "#5c6bc0" : "#3f51b5",
              }}
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : `Sign in as ${isTutor ? "Tutor" : "Student"}`}
            </button>
          </form>

          <p style={styles.link}>
            Don't have an account?{" "}
            <Link
              to={`/register/${role}`}
              style={{ color: "#5c6bc0", fontWeight: "600" }}
            >
              Register here
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
  loginBox: {
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
    outline: "none",
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
