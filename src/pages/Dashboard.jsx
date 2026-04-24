import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      if (profileData.role === "student") {
        const { data: m } = await supabase
          .from("modules")
          .select("*")
          .eq("grade", profileData.grade)
          .order("created_at", { ascending: false })
          .limit(4);
        setModules(m || []);

        const { data: a } = await supabase
          .from("assignments")
          .select("*")
          .eq("grade", profileData.grade)
          .order("due_date", { ascending: true })
          .limit(5);
        setAssignments(a || []);

        const { data: s } = await supabase
          .from("submissions")
          .select("*")
          .eq("student_id", user.id);
        setSubmissions(s || []);

        const { data: q } = await supabase
          .from("quizzes")
          .select("*")
          .eq("grade", profileData.grade)
          .order("created_at", { ascending: false })
          .limit(4);
        setQuizzes(q || []);

        const { data: at } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("student_id", user.id);
        setAttempts(at || []);
      } else {
        const assignedGrades = profileData.assigned_grades || [];

        let modQuery = supabase
          .from("modules")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })
          .limit(4);
        const { data: m } = await modQuery;
        setModules(m || []);

        let assignQuery = supabase
          .from("assignments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        if (assignedGrades.length > 0) {
          assignQuery = supabase
            .from("assignments")
            .select("*")
            .in("grade", assignedGrades)
            .order("created_at", { ascending: false })
            .limit(5);
        } else {
          assignQuery = supabase
            .from("assignments")
            .select("*")
            .eq("created_by", user.id)
            .order("created_at", { ascending: false })
            .limit(5);
        }
        const { data: a } = await assignQuery;
        setAssignments(a || []);

        const { data: assignmentIds } = await supabase
          .from("assignments")
          .select("id")
          .eq("created_by", user.id);
        const ids = (assignmentIds || []).map((a) => a.id);
        let subsData = [];
        if (ids.length > 0) {
          const { data: s } = await supabase
            .from("submissions")
            .select("*, profiles(full_name)")
            .in("assignment_id", ids)
            .order("submitted_at", { ascending: false })
            .limit(5);
          subsData = s || [];
        }
        setSubmissions(subsData);

        let quizQuery = supabase
          .from("quizzes")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })
          .limit(4);
        const { data: q } = await quizQuery;
        setQuizzes(q || []);
      }

      const { data: ann } = await supabase
        .from("announcements")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(3);
      setAnnouncements(ann || []);
      setLoading(false);
    };
    getData();
  }, []);

  const isSubmitted = (id) => submissions.some((s) => s.assignment_id === id);
  const isAttempted = (id) => attempts.some((a) => a.quiz_id === id);
  const getScore = (id) => {
    const a = attempts.find((a) => a.quiz_id === id);
    return a ? `${a.score}/${a.total}` : null;
  };
  const getStage = (grade) => {
    const g = String(grade);
    if (["1", "2", "3", "4", "5"].includes(g)) return "Primary";
    if (["6", "7", "8"].includes(g)) return "Lower Secondary";
    if (["9", "10"].includes(g)) return "GCSE";
    return "A-Level";
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎓</div>
          <p style={{ color: "#5c6bc0", fontSize: "16px" }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );

  const isTutor = profile && profile.role === "tutor";

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>
            {isTutor ? "Tutor Dashboard" : "Student Dashboard"}
          </h1>
          <p style={styles.pageDesc}>
            {isTutor
              ? `Welcome back, ${profile && profile.full_name}. Here's your overview.`
              : `Welcome back, ${profile && profile.full_name}. Grade ${profile && profile.grade} • ${profile && getStage(profile.grade)}`}
          </p>
        </div>
        {isTutor && (
          <div style={styles.topActions}>
            <button
              style={{ ...styles.actionBtn, background: "#5c6bc0" }}
              onClick={() => navigate("/modules")}
            >
              + New Module
            </button>
            <button
              style={{ ...styles.actionBtn, background: "#43a047" }}
              onClick={() => navigate("/assignments")}
            >
              + Assignment
            </button>
            <button
              style={{ ...styles.actionBtn, background: "#8e24aa" }}
              onClick={() => navigate("/quiz")}
            >
              + Quiz
            </button>
          </div>
        )}
      </div>

      <div style={styles.statsRow}>
        {(isTutor
          ? [
              {
                icon: "📚",
                num: modules.length,
                label: "Modules Published",
                color: "#5c6bc0",
                bg: "#ede7f6",
                path: "/modules",
              },
              {
                icon: "📝",
                num: assignments.length,
                label: "Assignments Set",
                color: "#1e88e5",
                bg: "#e3f2fd",
                path: "/assignments",
              },
              {
                icon: "📬",
                num: submissions.length,
                label: "Submissions Received",
                color: "#43a047",
                bg: "#e8f5e9",
                path: "/assignments",
              },
              {
                icon: "🧠",
                num: quizzes.length,
                label: "Quizzes Created",
                color: "#8e24aa",
                bg: "#f3e5f5",
                path: "/quiz",
              },
            ]
          : [
              {
                icon: "📚",
                num: modules.length,
                label: "Modules Available",
                color: "#5c6bc0",
                bg: "#ede7f6",
                path: "/modules",
              },
              {
                icon: "📝",
                num: assignments.length,
                label: "Assignments",
                color: "#1e88e5",
                bg: "#e3f2fd",
                path: "/assignments",
              },
              {
                icon: "✅",
                num: submissions.length,
                label: "Work Submitted",
                color: "#43a047",
                bg: "#e8f5e9",
                path: "/assignments",
              },
              {
                icon: "🏆",
                num: attempts.length,
                label: "Quizzes Completed",
                color: "#8e24aa",
                bg: "#f3e5f5",
                path: "/quiz",
              },
            ]
        ).map((s) => (
          <div
            key={s.label}
            style={{ ...styles.statCard, cursor: "pointer" }}
            onClick={() => navigate(s.path)}
          >
            <div style={{ ...styles.statIconBox, background: s.bg }}>
              <span style={{ fontSize: "24px" }}>{s.icon}</span>
            </div>
            <div>
              <h2 style={{ ...styles.statNum, color: s.color }}>{s.num}</h2>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.mainLeft}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                {isTutor ? "📚 Recent Modules" : "📚 My Modules"}
              </h3>
              <button
                style={styles.viewAllBtn}
                onClick={() => navigate("/modules")}
              >
                View all →
              </button>
            </div>
            {modules.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: "32px" }}>📭</p>
                <p>No modules yet</p>
                {isTutor && (
                  <button
                    style={styles.emptyBtn}
                    onClick={() => navigate("/modules")}
                  >
                    Upload your first module
                  </button>
                )}
              </div>
            ) : (
              modules.map((m) => (
                <div key={m.id} style={styles.listItem}>
                  <div style={{ ...styles.listIcon, background: "#ede7f6" }}>
                    📚
                  </div>
                  <div style={styles.listContent}>
                    <p style={styles.listTitle}>{m.title}</p>
                    <p style={styles.listSub}>
                      {m.subject} • Grade {m.grade}
                    </p>
                  </div>
                  {m.file_url && (
                    <button
                      onClick={() => window.open(m.file_url, "_blank")}
                      style={styles.listAction}
                    >
                      Download
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                {isTutor ? "📝 Recent Assignments" : "📝 My Assignments"}
              </h3>
              <button
                style={styles.viewAllBtn}
                onClick={() => navigate("/assignments")}
              >
                View all →
              </button>
            </div>
            {assignments.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: "32px" }}>📋</p>
                <p>No assignments yet</p>
              </div>
            ) : (
              assignments.map((a) => {
                const submitted = isSubmitted(a.id);
                const overdue = new Date(a.due_date) < new Date() && !submitted;
                return (
                  <div key={a.id} style={styles.listItem}>
                    <div
                      style={{
                        ...styles.listIcon,
                        background: submitted
                          ? "#e8f5e9"
                          : overdue
                            ? "#ffebee"
                            : "#e3f2fd",
                      }}
                    >
                      {submitted ? "✅" : overdue ? "⚠️" : "📝"}
                    </div>
                    <div style={styles.listContent}>
                      <p style={styles.listTitle}>{a.title}</p>
                      <p style={styles.listSub}>
                        {a.subject} • Due: {a.due_date}
                      </p>
                    </div>
                    {!isTutor && (
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: submitted
                            ? "#e8f5e9"
                            : overdue
                              ? "#ffebee"
                              : "#e3f2fd",
                          color: submitted
                            ? "#2e7d32"
                            : overdue
                              ? "#c62828"
                              : "#1565c0",
                        }}
                      >
                        {submitted
                          ? "Submitted"
                          : overdue
                            ? "Overdue"
                            : "Pending"}
                      </span>
                    )}
                    {isTutor && (
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: "#e3f2fd",
                          color: "#1565c0",
                        }}
                      >
                        {
                          submissions.filter((s) => s.assignment_id === a.id)
                            .length
                        }{" "}
                        submitted
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={styles.mainRight}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📢 Announcements</h3>
              <button
                style={styles.viewAllBtn}
                onClick={() => navigate("/announcements")}
              >
                View all →
              </button>
            </div>
            {announcements.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: "32px" }}>📭</p>
                <p>No announcements yet</p>
              </div>
            ) : (
              announcements.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    ...styles.announcementItem,
                    borderLeft:
                      i === 0 ? "3px solid #5c6bc0" : "3px solid #e0e0e0",
                  }}
                >
                  <p style={styles.annTitle}>{a.title}</p>
                  <p style={styles.annMeta}>
                    By {a.profiles && a.profiles.full_name} •{" "}
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                  <p style={styles.annContent}>{a.content}</p>
                </div>
              ))
            )}
            {isTutor && (
              <button
                style={styles.postAnnBtn}
                onClick={() => navigate("/announcements")}
              >
                + Post Announcement
              </button>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                🧠 {isTutor ? "My Quizzes" : "Quizzes"}
              </h3>
              <button
                style={styles.viewAllBtn}
                onClick={() => navigate("/quiz")}
              >
                View all →
              </button>
            </div>
            {quizzes.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: "32px" }}>🧠</p>
                <p>No quizzes yet</p>
              </div>
            ) : (
              quizzes.map((q) => {
                const attempted = isAttempted(q.id);
                const score = getScore(q.id);
                return (
                  <div key={q.id} style={styles.listItem}>
                    <div
                      style={{
                        ...styles.listIcon,
                        background: attempted ? "#f3e5f5" : "#fff3e0",
                      }}
                    >
                      {attempted ? "🏆" : "🧠"}
                    </div>
                    <div style={styles.listContent}>
                      <p style={styles.listTitle}>{q.title}</p>
                      <p style={styles.listSub}>
                        {q.subject} • Grade {q.grade}
                      </p>
                    </div>
                    {!isTutor && (
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: attempted ? "#f3e5f5" : "#fff3e0",
                          color: attempted ? "#6a1b9a" : "#e65100",
                        }}
                      >
                        {attempted ? score : "Not taken"}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div style={styles.card}>
            <h3 style={{ ...styles.cardTitle, marginBottom: "16px" }}>
              ⚡ Quick Actions
            </h3>
            <div style={styles.quickGrid}>
              {(isTutor
                ? [
                    {
                      icon: "📚",
                      label: "Upload Module",
                      path: "/modules",
                      color: "#5c6bc0",
                    },
                    {
                      icon: "📝",
                      label: "Post Assignment",
                      path: "/assignments",
                      color: "#1e88e5",
                    },
                    {
                      icon: "🧠",
                      label: "Create Quiz",
                      path: "/quiz",
                      color: "#8e24aa",
                    },
                    {
                      icon: "💬",
                      label: "Messages",
                      path: "/chat",
                      color: "#00897b",
                    },
                    {
                      icon: "📅",
                      label: "Timetable",
                      path: "/timetable",
                      color: "#f4511e",
                    },
                    {
                      icon: "🎥",
                      label: "Start Meeting",
                      path: "/meeting",
                      color: "#e53935",
                    },
                  ]
                : [
                    {
                      icon: "📚",
                      label: "View Modules",
                      path: "/modules",
                      color: "#5c6bc0",
                    },
                    {
                      icon: "📝",
                      label: "Submit Work",
                      path: "/assignments",
                      color: "#1e88e5",
                    },
                    {
                      icon: "🧠",
                      label: "Take Quiz",
                      path: "/quiz",
                      color: "#8e24aa",
                    },
                    {
                      icon: "💬",
                      label: "Chat Tutor",
                      path: "/chat",
                      color: "#00897b",
                    },
                    {
                      icon: "📅",
                      label: "Timetable",
                      path: "/timetable",
                      color: "#f4511e",
                    },
                    {
                      icon: "🎥",
                      label: "Join Meeting",
                      path: "/meeting",
                      color: "#e53935",
                    },
                  ]
              ).map((a) => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  style={{
                    ...styles.quickBtn,
                    borderTop: `3px solid ${a.color}`,
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{a.icon}</span>
                  <span style={styles.quickLabel}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "1400px", margin: "0 auto" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  pageDesc: { fontSize: "14px", color: "#888" },
  topActions: { display: "flex", gap: "10px" },
  actionBtn: {
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  statsRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: "180px",
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
  },
  statIconBox: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statNum: { fontSize: "28px", fontWeight: "800", lineHeight: 1 },
  statLabel: { fontSize: "12px", color: "#888", marginTop: "4px" },
  mainGrid: { display: "flex", gap: "20px", flexWrap: "wrap" },
  mainLeft: {
    flex: 2,
    minWidth: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  mainRight: {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    background: "white",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e" },
  viewAllBtn: {
    background: "none",
    border: "none",
    color: "#5c6bc0",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  listIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },
  listContent: { flex: 1 },
  listTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "2px",
  },
  listSub: { fontSize: "12px", color: "#999" },
  listAction: {
    background: "#f0f0ff",
    color: "#5c6bc0",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  emptyState: {
    textAlign: "center",
    padding: "24px",
    color: "#aaa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  emptyBtn: {
    background: "#5c6bc0",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    marginTop: "8px",
  },
  announcementItem: { padding: "12px 0 12px 12px", marginBottom: "8px" },
  annTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  annMeta: { fontSize: "11px", color: "#aaa", marginBottom: "6px" },
  annContent: { fontSize: "13px", color: "#666", lineHeight: 1.5 },
  postAnnBtn: {
    width: "100%",
    padding: "10px",
    background: "#f8f9ff",
    color: "#5c6bc0",
    border: "2px dashed #c5cae9",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "12px",
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
  },
  quickBtn: {
    background: "white",
    border: "1px solid #f0f0f0",
    borderRadius: "10px",
    padding: "12px 8px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.15s",
  },
  quickLabel: {
    fontSize: "11px",
    color: "#555",
    fontWeight: "600",
    textAlign: "center",
  },
};
