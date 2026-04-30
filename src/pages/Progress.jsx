import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#5c6bc0",
  "#43a047",
  "#f4511e",
  "#8e24aa",
  "#1e88e5",
  "#00897b",
];

export default function Progress() {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
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
        await loadStudentData(user.id, profileData);
      } else {
        const assignedGrades = profileData.assigned_grades || [];
        let studentQuery = supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
          .order("full_name");
        if (assignedGrades.length > 0) {
          studentQuery = studentQuery.in("grade", assignedGrades);
        }
        const { data: s } = await studentQuery;
        setStudents(s || []);
        if (s && s.length > 0) {
          setSelectedStudent(s[0]);
          await loadStudentData(s[0].id, s[0]);
        }
      }
      setLoading(false);
    };
    getData();
  }, []);

  const loadStudentData = async (studentId, studentProfile) => {
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("student_id", studentId);
    setQuizAttempts(attempts || []);
    const { data: q } = await supabase
      .from("quizzes")
      .select("*")
      .eq("grade", studentProfile.grade);
    setQuizzes(q || []);
    const { data: a } = await supabase
      .from("assignments")
      .select("*")
      .eq("grade", studentProfile.grade);
    setAssignments(a || []);
    const { data: s } = await supabase
      .from("submissions")
      .select("*")
      .eq("student_id", studentId);
    setSubmissions(s || []);
  };

  const handleStudentChange = async (student) => {
    setSelectedStudent(student);
    setLoading(true);
    await loadStudentData(student.id, student);
    setLoading(false);
  };

  const getQuizChartData = () => {
    return quizzes.map((q) => {
      const attempt = quizAttempts.find((a) => a.quiz_id === q.id);
      return {
        name: q.title.length > 15 ? q.title.substring(0, 15) + "..." : q.title,
        score: attempt ? Math.round((attempt.score / attempt.total) * 100) : 0,
        fullMark: 100,
        attempted: attempt ? "Yes" : "No",
      };
    });
  };

  const getAssignmentChartData = () => {
    return assignments.map((a) => {
      const submission = submissions.find((s) => s.assignment_id === a.id);
      let gradeValue = 0;
      if (submission && submission.grade) {
        const gradeMap = {
          "A*": 100,
          A: 90,
          B: 75,
          C: 60,
          D: 45,
          E: 30,
          U: 10,
        };
        if (gradeMap[submission.grade]) {
          gradeValue = gradeMap[submission.grade];
        } else if (submission.grade.includes("%")) {
          gradeValue = parseInt(submission.grade);
        }
      }
      return {
        name: a.title.length > 15 ? a.title.substring(0, 15) + "..." : a.title,
        grade: gradeValue,
        submitted: submission ? 1 : 0,
        status: submission
          ? submission.grade
            ? "Graded"
            : "Submitted"
          : "Pending",
      };
    });
  };

  const getProgressSummary = () => {
    const totalQuizzes = quizzes.length;
    const attemptedQuizzes = quizAttempts.length;
    const totalAssignments = assignments.length;
    const submittedAssignments = submissions.length;
    const avgScore =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce(
              (sum, a) => sum + (a.score / a.total) * 100,
              0,
            ) / quizAttempts.length,
          )
        : 0;
    const gradedSubmissions = submissions.filter((s) => s.grade).length;
    return {
      totalQuizzes,
      attemptedQuizzes,
      totalAssignments,
      submittedAssignments,
      avgScore,
      gradedSubmissions,
    };
  };

  const getPieData = () => {
    const summary = getProgressSummary();
    return [
      {
        name: "Quizzes Done",
        value: summary.attemptedQuizzes,
        color: "#5c6bc0",
      },
      {
        name: "Quizzes Pending",
        value: Math.max(0, summary.totalQuizzes - summary.attemptedQuizzes),
        color: "#e0e0e0",
      },
    ];
  };

  const getAssignmentPieData = () => {
    const summary = getProgressSummary();
    return [
      {
        name: "Submitted",
        value: summary.submittedAssignments,
        color: "#43a047",
      },
      {
        name: "Pending",
        value: Math.max(
          0,
          summary.totalAssignments - summary.submittedAssignments,
        ),
        color: "#e0e0e0",
      },
    ];
  };

  const getStage = (grade) => {
    const g = String(grade);
    if (["1", "2", "3", "4", "5"].includes(g)) return "Primary";
    if (["6", "7", "8"].includes(g)) return "Lower Secondary";
    if (["9", "10"].includes(g)) return "GCSE";
    return "A-Level";
  };

  const summary = getProgressSummary();
  const quizData = getQuizChartData();
  const assignmentData = getAssignmentChartData();
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
            Loading progress data...
          </p>
        </div>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Progress Report</h1>
          <p style={styles.subtitle}>
            {isTutor
              ? "View student progress and performance"
              : "Track your learning progress"}
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
                    Grade {s.grade}
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
          <div>
            <h2 style={styles.studentName}>{displayStudent.full_name}</h2>
            <p style={styles.studentInfo}>
              Grade {displayStudent.grade} • {getStage(displayStudent.grade)} •
              {isTutor ? " Student" : " Your Progress Report"}
            </p>
          </div>
        </div>
      )}

      <div style={styles.summaryRow}>
        {[
          {
            icon: "🧠",
            num: summary.attemptedQuizzes,
            total: summary.totalQuizzes,
            label: "Quizzes Completed",
            color: "#5c6bc0",
            bg: "#ede7f6",
          },
          {
            icon: "📝",
            num: summary.submittedAssignments,
            total: summary.totalAssignments,
            label: "Assignments Submitted",
            color: "#43a047",
            bg: "#e8f5e9",
          },
          {
            icon: "🏆",
            num: summary.avgScore + "%",
            total: null,
            label: "Average Quiz Score",
            color: "#f4511e",
            bg: "#fff3e0",
          },
          {
            icon: "⭐",
            num: summary.gradedSubmissions,
            total: summary.submittedAssignments,
            label: "Assignments Graded",
            color: "#8e24aa",
            bg: "#f3e5f5",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{ ...styles.summaryCard, borderTop: `3px solid ${s.color}` }}
          >
            <div style={{ ...styles.summaryIcon, background: s.bg }}>
              <span style={{ fontSize: "24px" }}>{s.icon}</span>
            </div>
            <div>
              <h2 style={{ ...styles.summaryNum, color: s.color }}>
                {s.num}
                {s.total !== null ? `/${s.total}` : ""}
              </h2>
              <p style={styles.summaryLabel}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🧠 Quiz Performance</h3>
          <p style={styles.chartSubtitle}>Score percentage for each quiz</p>
          {quizData.length === 0 ? (
            <div style={styles.emptyChart}>
              <p style={{ fontSize: "32px" }}>📭</p>
              <p>No quiz data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={quizData}
                margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  tick={{ fontSize: 11 }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                <Bar
                  dataKey="score"
                  fill="#5c6bc0"
                  radius={[6, 6, 0, 0]}
                  label={{
                    position: "top",
                    fontSize: 11,
                    formatter: (v) => (v > 0 ? `${v}%` : ""),
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📝 Assignment Grades</h3>
          <p style={styles.chartSubtitle}>Grade score for each assignment</p>
          {assignmentData.length === 0 ? (
            <div style={styles.emptyChart}>
              <p style={{ fontSize: "32px" }}>📭</p>
              <p>No assignment data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={assignmentData}
                margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  tick={{ fontSize: 11 }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(value) => [`${value}%`, "Grade Score"]} />
                <Bar
                  dataKey="grade"
                  fill="#43a047"
                  radius={[6, 6, 0, 0]}
                  label={{
                    position: "top",
                    fontSize: 11,
                    formatter: (v) => (v > 0 ? `${v}%` : "⏳"),
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📊 Quiz Completion Rate</h3>
          <p style={styles.chartSubtitle}>
            {summary.attemptedQuizzes} out of {summary.totalQuizzes} quizzes
            completed
          </p>
          {summary.totalQuizzes === 0 ? (
            <div style={styles.emptyChart}>
              <p style={{ fontSize: "32px" }}>📭</p>
              <p>No quizzes available yet</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.pieCenter}>
                <p style={styles.pieCenterNum}>
                  {summary.totalQuizzes > 0
                    ? Math.round(
                        (summary.attemptedQuizzes / summary.totalQuizzes) * 100,
                      )
                    : 0}
                  %
                </p>
                <p style={styles.pieCenterLabel}>Completed</p>
              </div>
            </div>
          )}
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📬 Assignment Completion Rate</h3>
          <p style={styles.chartSubtitle}>
            {summary.submittedAssignments} out of {summary.totalAssignments}{" "}
            assignments submitted
          </p>
          {summary.totalAssignments === 0 ? (
            <div style={styles.emptyChart}>
              <p style={{ fontSize: "32px" }}>📭</p>
              <p>No assignments available yet</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={getAssignmentPieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {getAssignmentPieData().map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.pieCenter}>
                <p style={styles.pieCenterNum}>
                  {summary.totalAssignments > 0
                    ? Math.round(
                        (summary.submittedAssignments /
                          summary.totalAssignments) *
                          100,
                      )
                    : 0}
                  %
                </p>
                <p style={styles.pieCenterLabel}>Submitted</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>📈 Overall Performance Summary</h3>
        <p style={styles.chartSubtitle}>
          Quiz scores trend across all attempts
        </p>
        {quizData.length === 0 ? (
          <div style={styles.emptyChart}>
            <p style={{ fontSize: "32px" }}>📭</p>
            <p>No data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={quizData}
              margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                tick={{ fontSize: 11 }}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#5c6bc0"
                strokeWidth={3}
                dot={{ fill: "#5c6bc0", r: 6 }}
                activeDot={{ r: 8 }}
                name="Quiz Score %"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={styles.detailsCard}>
        <h3 style={styles.chartTitle}>📋 Detailed Assignment Results</h3>
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={{ flex: 2 }}>Assignment</span>
            <span style={{ flex: 1 }}>Subject</span>
            <span style={{ flex: 1 }}>Status</span>
            <span style={{ flex: 1 }}>Grade</span>
            <span style={{ flex: 2 }}>Feedback</span>
          </div>
          {assignments.length === 0 ? (
            <p style={{ textAlign: "center", color: "#aaa", padding: "20px" }}>
              No assignments yet
            </p>
          ) : (
            assignments.map((a) => {
              const sub = submissions.find((s) => s.assignment_id === a.id);
              return (
                <div key={a.id} style={styles.tableRow}>
                  <span
                    style={{
                      flex: 2,
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#1a1a2e",
                    }}
                  >
                    {a.title}
                  </span>
                  <span style={{ flex: 1, fontSize: "13px", color: "#888" }}>
                    {a.subject}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        background: sub ? "#e8f5e9" : "#fff3e0",
                        color: sub ? "#2e7d32" : "#e65100",
                      }}
                    >
                      {sub ? "✅ Submitted" : "⏳ Pending"}
                    </span>
                  </span>
                  <span style={{ flex: 1 }}>
                    {sub && sub.grade ? (
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: "#ede7f6",
                          color: "#5c6bc0",
                          fontWeight: "700",
                        }}
                      >
                        {sub.grade}
                      </span>
                    ) : (
                      <span style={{ fontSize: "13px", color: "#aaa" }}>
                        {sub ? "Awaiting grade" : "—"}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      flex: 2,
                      fontSize: "13px",
                      color: "#666",
                      fontStyle: sub && sub.feedback ? "normal" : "italic",
                    }}
                  >
                    {sub && sub.feedback
                      ? sub.feedback
                      : sub
                        ? "No feedback yet"
                        : "—"}
                  </span>
                </div>
              );
            })
          )}
        </div>
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
  summaryRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
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
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  summaryNum: { fontSize: "24px", fontWeight: "800", lineHeight: 1 },
  summaryLabel: { fontSize: "12px", color: "#888", marginTop: "4px" },
  chartsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  chartCard: {
    flex: 1,
    minWidth: "300px",
    background: "white",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
    marginBottom: "24px",
    position: "relative",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  chartSubtitle: { fontSize: "13px", color: "#888", marginBottom: "20px" },
  emptyChart: {
    textAlign: "center",
    padding: "40px",
    color: "#aaa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  pieCenter: {
    textAlign: "center",
    marginTop: "12px",
    padding: "10px 20px",
    background: "#f8f9ff",
    borderRadius: "10px",
  },
  pieCenterNum: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#5c6bc0",
    lineHeight: 1,
  },
  pieCenterLabel: { fontSize: "13px", color: "#888", marginTop: "4px" },
  detailsCard: {
    background: "white",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
    marginBottom: "24px",
  },
  table: { marginTop: "16px" },
  tableHeader: {
    display: "flex",
    padding: "10px 16px",
    background: "#f8f9ff",
    borderRadius: "8px",
    marginBottom: "8px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#5c6bc0",
  },
  tableRow: {
    display: "flex",
    padding: "12px 16px",
    borderBottom: "1px solid #f5f5f5",
    alignItems: "center",
    gap: "8px",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
};
