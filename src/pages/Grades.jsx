import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

export default function Grades() {
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!profileData) return;
      setProfile(profileData);

      if (profileData.role === "student") {
        const { data: a } = await supabase
          .from("assignments")
          .select("*")
          .eq("grade", profileData.grade);
        setAssignments(a || []);
        const { data: s } = await supabase
          .from("submissions")
          .select("*")
          .eq("student_id", user.id);
        setSubmissions(s || []);
        const { data: q } = await supabase
          .from("quizzes")
          .select("*")
          .eq("grade", profileData.grade);
        setQuizzes(q || []);
        const { data: at } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("student_id", user.id);
        setAttempts(at || []);
      } else {
        const assignedGrades = profileData.assigned_grades || [];
        let studentQuery = supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
          .order("grade");
        if (assignedGrades.length > 0) {
          studentQuery = studentQuery.in("grade", assignedGrades);
        }
        const { data: st } = await studentQuery;
        setStudents(st || []);
        if (st && st.length > 0) {
          await loadStudentGrades(st[0], profileData);
          setSelectedStudent(st[0]);
        }
      }
      setLoading(false);
    };
    getData();
  }, []);

  const loadStudentGrades = async (student, profileData) => {
    const { data: a } = await supabase
      .from("assignments")
      .select("*")
      .eq("grade", student.grade);
    setAssignments(a || []);
    const { data: s } = await supabase
      .from("submissions")
      .select("*")
      .eq("student_id", student.id);
    setSubmissions(s || []);
    const { data: q } = await supabase
      .from("quizzes")
      .select("*")
      .eq("grade", student.grade);
    setQuizzes(q || []);
    const { data: at } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("student_id", student.id);
    setAttempts(at || []);
  };

  const handleStudentChange = async (student) => {
    setLoading(true);
    setSelectedStudent(student);
    await loadStudentGrades(student, profile);
    setLoading(false);
  };

  const getGradeColor = (grade) => {
    if (!grade) return { bg: "#fff3e0", color: "#e65100" };
    if (grade === "A*" || grade === "A")
      return { bg: "#e8f5e9", color: "#2e7d32" };
    if (grade === "B") return { bg: "#e3f2fd", color: "#1565c0" };
    if (grade === "C") return { bg: "#fff3e0", color: "#e65100" };
    if (grade === "D" || grade === "E")
      return { bg: "#fff8e1", color: "#f57f17" };
    if (grade === "U") return { bg: "#ffebee", color: "#c62828" };
    if (grade.includes("%")) {
      const num = parseInt(grade);
      if (num >= 80) return { bg: "#e8f5e9", color: "#2e7d32" };
      if (num >= 60) return { bg: "#e3f2fd", color: "#1565c0" };
      if (num >= 40) return { bg: "#fff3e0", color: "#e65100" };
      return { bg: "#ffebee", color: "#c62828" };
    }
    return { bg: "#f3e5f5", color: "#6a1b9a" };
  };

  const getOverallGrade = () => {
    const gradedSubs = submissions.filter((s) => s.grade);
    if (gradedSubs.length === 0) return "N/A";
    const gradeMap = { "A*": 100, A: 90, B: 75, C: 60, D: 45, E: 30, U: 10 };
    const scores = gradedSubs.map((s) => {
      if (gradeMap[s.grade]) return gradeMap[s.grade];
      if (s.grade.includes("%")) return parseInt(s.grade);
      return 0;
    });
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg >= 90) return "A*";
    if (avg >= 80) return "A";
    if (avg >= 70) return "B";
    if (avg >= 60) return "C";
    if (avg >= 50) return "D";
    if (avg >= 40) return "E";
    return "U";
  };

  const getAvgQuizScore = () => {
    if (attempts.length === 0) return "N/A";
    const avg =
      attempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) /
      attempts.length;
    return Math.round(avg) + "%";
  };

  const getStage = (grade) => {
    const g = String(grade);
    if (["1", "2", "3", "4", "5"].includes(g)) return "Primary";
    if (["6", "7", "8"].includes(g)) return "Lower Secondary";
    if (["9", "10"].includes(g)) return "GCSE";
    return "A-Level";
  };

  const isTutor = profile && profile.role === "tutor";
  const displayStudent = isTutor ? selectedStudent : profile;

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
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
          <p style={{ color: "#5c6bc0", fontSize: "16px" }}>
            Loading grades...
          </p>
        </div>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📋 Grades</h1>
          <p style={styles.subtitle}>
            {isTutor
              ? "View grades for your students"
              : "Your assignment and quiz grades"}
          </p>
        </div>
      </div>

      {isTutor && students.length > 0 && (
        <div style={styles.studentSelector}>
          <p style={styles.selectorLabel}>Select Student:</p>
          <div style={styles.studentPills}>
            {students.map((s) => (
              <div
                key={s.id}
                onClick={() => handleStudentChange(s)}
                style={{
                  ...styles.studentPill,
                  background:
                    selectedStudent && selectedStudent.id === s.id
                      ? "#5c6bc0"
                      : "white",
                  color:
                    selectedStudent && selectedStudent.id === s.id
                      ? "white"
                      : "#333",
                  border: `2px solid ${selectedStudent && selectedStudent.id === s.id ? "#5c6bc0" : "#e0e0e0"}`,
                }}
              >
                <div
                  style={{
                    ...styles.pillAvatar,
                    background:
                      selectedStudent && selectedStudent.id === s.id
                        ? "white"
                        : "#5c6bc0",
                    color:
                      selectedStudent && selectedStudent.id === s.id
                        ? "#5c6bc0"
                        : "white",
                  }}
                >
                  {s.full_name && s.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600" }}>
                    {s.full_name}
                  </p>
                  <p style={{ fontSize: "11px", opacity: 0.7 }}>
                    Grade {s.grade} • {getStage(s.grade)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {displayStudent && (
        <div style={styles.studentCard}>
          <div style={styles.studentAvatar}>
            {displayStudent.full_name &&
              displayStudent.full_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={styles.studentName}>{displayStudent.full_name}</h2>
            <p style={styles.studentInfo}>
              Grade {displayStudent.grade} • {getStage(displayStudent.grade)}
            </p>
          </div>
          <div style={styles.overallGradeBox}>
            <p style={styles.overallLabel}>Overall Grade</p>
            <p
              style={{
                ...styles.overallValue,
                color: getGradeColor(getOverallGrade()).color,
              }}
            >
              {getOverallGrade()}
            </p>
          </div>
          <div style={styles.overallGradeBox}>
            <p style={styles.overallLabel}>Avg Quiz Score</p>
            <p style={{ ...styles.overallValue, color: "#5c6bc0" }}>
              {getAvgQuizScore()}
            </p>
          </div>
        </div>
      )}

      <div style={styles.summaryRow}>
        {[
          {
            icon: "📝",
            num: assignments.length,
            label: "Total Assignments",
            color: "#5c6bc0",
            bg: "#ede7f6",
          },
          {
            icon: "✅",
            num: submissions.length,
            label: "Submitted",
            color: "#43a047",
            bg: "#e8f5e9",
          },
          {
            icon: "⭐",
            num: submissions.filter((s) => s.grade).length,
            label: "Graded",
            color: "#f4511e",
            bg: "#fff3e0",
          },
          {
            icon: "🧠",
            num: attempts.length,
            label: "Quizzes Done",
            color: "#8e24aa",
            bg: "#f3e5f5",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{ ...styles.summaryCard, borderTop: `3px solid ${s.color}` }}
          >
            <div style={{ ...styles.summaryIcon, background: s.bg }}>
              <span style={{ fontSize: "22px" }}>{s.icon}</span>
            </div>
            <div>
              <h2 style={{ ...styles.summaryNum, color: s.color }}>{s.num}</h2>
              <p style={styles.summaryLabel}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📝 Assignment Grades</h2>
        {assignments.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "40px" }}>📭</p>
            <p>No assignments yet</p>
          </div>
        ) : (
          <div style={styles.gradesGrid}>
            {assignments.map((a) => {
              const sub = submissions.find((s) => s.assignment_id === a.id);
              const gradeStyle = getGradeColor(sub?.grade);
              const overdue = new Date(a.due_date) < new Date() && !sub;
              return (
                <div
                  key={a.id}
                  style={{
                    ...styles.gradeCard,
                    borderTop: `3px solid ${sub?.grade ? gradeStyle.color : overdue ? "#f44336" : "#5c6bc0"}`,
                  }}
                >
                  <div style={styles.gradeCardTop}>
                    <div style={styles.gradeCardInfo}>
                      <h3 style={styles.gradeCardTitle}>{a.title}</h3>
                      <p style={styles.gradeCardSub}>
                        {a.subject} • Grade {a.grade} • Due: {a.due_date}
                      </p>
                    </div>
                    <div
                      style={{
                        ...styles.gradeBadge,
                        background: gradeStyle.bg,
                        color: gradeStyle.color,
                      }}
                    >
                      {sub?.grade || (sub ? "⏳" : overdue ? "❌" : "📝")}
                    </div>
                  </div>
                  <div style={styles.gradeCardStatus}>
                    <span
                      style={{
                        ...styles.statusPill,
                        background: sub
                          ? "#e8f5e9"
                          : overdue
                            ? "#ffebee"
                            : "#e3f2fd",
                        color: sub
                          ? "#2e7d32"
                          : overdue
                            ? "#c62828"
                            : "#1565c0",
                      }}
                    >
                      {sub
                        ? sub.grade
                          ? "✅ Graded"
                          : "📬 Awaiting Grade"
                        : overdue
                          ? "❌ Not Submitted"
                          : "⏳ Pending"}
                    </span>
                  </div>
                  {sub?.feedback && (
                    <div style={styles.feedbackBox}>
                      <p style={styles.feedbackLabel}>💬 Tutor Feedback:</p>
                      <p style={styles.feedbackText}>{sub.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🧠 Quiz Grades</h2>
        {quizzes.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "40px" }}>📭</p>
            <p>No quizzes yet</p>
          </div>
        ) : (
          <div style={styles.gradesGrid}>
            {quizzes.map((q) => {
              const attempt = attempts.find((a) => a.quiz_id === q.id);
              const score = attempt
                ? Math.round((attempt.score / attempt.total) * 100)
                : null;
              const scoreColor =
                score === null
                  ? { bg: "#f5f5f5", color: "#888" }
                  : score >= 80
                    ? { bg: "#e8f5e9", color: "#2e7d32" }
                    : score >= 60
                      ? { bg: "#e3f2fd", color: "#1565c0" }
                      : score >= 40
                        ? { bg: "#fff3e0", color: "#e65100" }
                        : { bg: "#ffebee", color: "#c62828" };
              return (
                <div
                  key={q.id}
                  style={{
                    ...styles.gradeCard,
                    borderTop: `3px solid ${attempt ? scoreColor.color : "#888"}`,
                  }}
                >
                  <div style={styles.gradeCardTop}>
                    <div style={styles.gradeCardInfo}>
                      <h3 style={styles.gradeCardTitle}>{q.title}</h3>
                      <p style={styles.gradeCardSub}>
                        {q.subject} • Grade {q.grade}
                      </p>
                    </div>
                    <div
                      style={{
                        ...styles.gradeBadge,
                        background: scoreColor.bg,
                        color: scoreColor.color,
                        fontSize: "16px",
                      }}
                    >
                      {attempt ? `${attempt.score}/${attempt.total}` : "—"}
                    </div>
                  </div>
                  <div style={styles.gradeCardStatus}>
                    <span
                      style={{
                        ...styles.statusPill,
                        background: attempt ? scoreColor.bg : "#f5f5f5",
                        color: attempt ? scoreColor.color : "#888",
                      }}
                    >
                      {attempt
                        ? `${score}% — ${score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Pass" : "Needs Work"}`
                        : "⏳ Not attempted"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "1400px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    color: "#1a1a2e",
    marginBottom: "4px",
    fontWeight: "700",
  },
  subtitle: { fontSize: "14px", color: "#888" },
  studentSelector: {
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    marginBottom: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
  },
  selectorLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "12px",
  },
  studentPills: { display: "flex", gap: "12px", flexWrap: "wrap" },
  studentPill: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
  },
  pillAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  studentCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    marginBottom: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
  },
  studentAvatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#5c6bc0",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "22px",
    flexShrink: 0,
  },
  studentName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  studentInfo: { fontSize: "14px", color: "#888" },
  overallGradeBox: {
    textAlign: "center",
    padding: "12px 20px",
    background: "#f8f9ff",
    borderRadius: "12px",
  },
  overallLabel: {
    fontSize: "11px",
    color: "#888",
    marginBottom: "4px",
    fontWeight: "600",
  },
  overallValue: { fontSize: "28px", fontWeight: "800", lineHeight: 1 },
  summaryRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  summaryCard: {
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
  summaryIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  summaryNum: { fontSize: "26px", fontWeight: "800", lineHeight: 1 },
  summaryLabel: { fontSize: "12px", color: "#888", marginTop: "4px" },
  section: { marginBottom: "32px" },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "16px",
  },
  gradesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px",
  },
  gradeCard: {
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
  },
  gradeCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  gradeCardInfo: { flex: 1, paddingRight: "12px" },
  gradeCardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  gradeCardSub: { fontSize: "12px", color: "#888" },
  gradeBadge: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "20px",
    flexShrink: 0,
  },
  gradeCardStatus: { marginBottom: "8px" },
  statusPill: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  feedbackBox: {
    background: "#f8f9ff",
    padding: "10px 12px",
    borderRadius: "8px",
    marginTop: "8px",
  },
  feedbackLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#5c6bc0",
    marginBottom: "4px",
  },
  feedbackText: { fontSize: "13px", color: "#444", lineHeight: 1.5 },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#aaa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
};
