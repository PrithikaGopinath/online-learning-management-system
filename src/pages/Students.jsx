import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";

const STAGES = {
  Primary: {
    grades: ["1", "2", "3", "4", "5"],
    color: "#43a047",
    bg: "#e8f5e9",
    icon: "🌱",
  },
  "Lower Secondary": {
    grades: ["6", "7", "8"],
    color: "#1e88e5",
    bg: "#e3f2fd",
    icon: "📘",
  },
  GCSE: { grades: ["9", "10"], color: "#f4511e", bg: "#fff3e0", icon: "📙" },
  "A-Level": {
    grades: ["11", "12"],
    color: "#8e24aa",
    bg: "#f3e5f5",
    icon: "🎓",
  },
};

const getStage = (grade) => {
  const g = String(grade);
  if (["1", "2", "3", "4", "5"].includes(g)) return "Primary";
  if (["6", "7", "8"].includes(g)) return "Lower Secondary";
  if (["9", "10"].includes(g)) return "GCSE";
  return "A-Level";
};

export default function Students() {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterStage, setFilterStage] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      if (profileData && profileData.role === "tutor") {
        const { data: s } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
          .order("grade");
        setStudents(s || []);

        const { data: sub } = await supabase.from("submissions").select("*");
        setSubmissions(sub || []);

        const { data: att } = await supabase.from("quiz_attempts").select("*");
        setAttempts(att || []);

        const { data: mod } = await supabase
          .from("modules")
          .select("*")
          .eq("created_by", user.id);
        setModules(mod || []);
      }
      setLoading(false);
    };
    getData();
  }, []);

  const getStudentSubmissions = (studentId) =>
    submissions.filter((s) => s.student_id === studentId).length;

  const getStudentAttempts = (studentId) =>
    attempts.filter((a) => a.student_id === studentId).length;

  const getAverageScore = (studentId) => {
    const studentAttempts = attempts.filter((a) => a.student_id === studentId);
    if (studentAttempts.length === 0) return null;
    const avg =
      studentAttempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) /
      studentAttempts.length;
    return Math.round(avg);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#43a047";
    if (score >= 50) return "#f4511e";
    return "#e53935";
  };

  const filteredStudents = students.filter((s) => {
    const stage = getStage(s.grade);
    if (filterStage !== "All" && stage !== filterStage) return false;
    if (search && !s.full_name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const groupedStudents = {};
  filteredStudents.forEach((s) => {
    const stage = getStage(s.grade);
    if (!groupedStudents[stage]) groupedStudents[stage] = [];
    groupedStudents[stage].push(s);
  });

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
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>👨‍🎓</div>
          <p style={{ color: "#5c6bc0", fontSize: "16px" }}>
            Loading students...
          </p>
        </div>
      </div>
    );

  if (profile && profile.role !== "tutor") {
    return (
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.pageTitle}>My Profile</h1>
        </div>
        <div style={styles.profileCard}>
          <div style={styles.profileAvatar}>
            {profile.full_name && profile.full_name.charAt(0).toUpperCase()}
          </div>
          <h2 style={styles.profileName}>{profile.full_name}</h2>
          <p style={styles.profileGrade}>
            Grade {profile.grade} • {getStage(profile.grade)}
          </p>
          <div style={styles.profileStats}>
            <div style={styles.profileStat}>
              <span style={styles.profileStatNum}>
                {submissions.filter((s) => s.student_id === profile.id).length}
              </span>
              <span style={styles.profileStatLabel}>Submitted</span>
            </div>
            <div style={styles.profileStatDivider} />
            <div style={styles.profileStat}>
              <span style={styles.profileStatNum}>
                {attempts.filter((a) => a.student_id === profile.id).length}
              </span>
              <span style={styles.profileStatLabel}>Quizzes Done</span>
            </div>
          </div>
          <div style={styles.stageCard}>
            <span style={{ fontSize: "24px" }}>
              {STAGES[getStage(profile.grade)].icon}
            </span>
            <div>
              <p
                style={{
                  fontWeight: "600",
                  color: "#1a1a2e",
                  fontSize: "14px",
                }}
              >
                {getStage(profile.grade)} Stage
              </p>
              <p style={{ fontSize: "12px", color: "#888" }}>
                UK Curriculum • Grades{" "}
                {STAGES[getStage(profile.grade)].grades.join(", ")}
              </p>
            </div>
          </div>
          <button
            style={styles.viewModulesBtn}
            onClick={() => navigate("/modules")}
          >
            View My Modules →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>Students</h1>
          <p style={styles.pageDesc}>
            {students.length} students enrolled across all grades
          </p>
        </div>
      </div>

      <div style={styles.statsRow}>
        {Object.entries(STAGES).map(([stage, data]) => {
          const count = students.filter(
            (s) => getStage(s.grade) === stage,
          ).length;
          return (
            <div
              key={stage}
              style={{
                ...styles.stageStatCard,
                borderTop: `3px solid ${data.color}`,
                cursor: "pointer",
                background: filterStage === stage ? data.bg : "white",
              }}
              onClick={() =>
                setFilterStage(filterStage === stage ? "All" : stage)
              }
            >
              <span style={{ fontSize: "28px" }}>{data.icon}</span>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: data.color,
                }}
              >
                {count}
              </h2>
              <p style={{ fontSize: "12px", color: "#888", fontWeight: "500" }}>
                {stage}
              </p>
            </div>
          );
        })}
      </div>

      <div style={styles.filterRow}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="🔍 Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={styles.stagePills}>
          <span
            onClick={() => setFilterStage("All")}
            style={{
              ...styles.pill,
              background: filterStage === "All" ? "#5c6bc0" : "#f0f0f0",
              color: filterStage === "All" ? "white" : "#555",
            }}
          >
            All Stages
          </span>
          {Object.entries(STAGES).map(([stage, data]) => (
            <span
              key={stage}
              onClick={() => setFilterStage(stage)}
              style={{
                ...styles.pill,
                background: filterStage === stage ? data.color : data.bg,
                color: filterStage === stage ? "white" : data.color,
              }}
            >
              {data.icon} {stage}
            </span>
          ))}
        </div>
      </div>

      {Object.keys(groupedStudents).length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: "48px", marginBottom: "12px" }}>👨‍🎓</p>
          <p style={{ color: "#666", fontSize: "18px" }}>No students found</p>
          <p style={{ color: "#aaa", fontSize: "14px", marginTop: "8px" }}>
            Students will appear here once they register
          </p>
        </div>
      ) : (
        Object.entries(STAGES).map(([stageName, stageData]) => {
          const stageStudents = groupedStudents[stageName];
          if (!stageStudents || stageStudents.length === 0) return null;
          return (
            <div key={stageName} style={styles.stageSection}>
              <div
                style={{
                  ...styles.stageHeader,
                  background: stageData.bg,
                  borderLeft: `4px solid ${stageData.color}`,
                }}
              >
                <div style={styles.stageHeaderLeft}>
                  <span style={{ fontSize: "24px" }}>{stageData.icon}</span>
                  <div>
                    <h2
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: stageData.color,
                      }}
                    >
                      {stageName}
                    </h2>
                    <p style={{ fontSize: "12px", color: "#888" }}>
                      Grades {stageData.grades.join(", ")} •{" "}
                      {stageStudents.length} students
                    </p>
                  </div>
                </div>
                <span
                  style={{ ...styles.countBadge, background: stageData.color }}
                >
                  {stageStudents.length}{" "}
                  {stageStudents.length === 1 ? "student" : "students"}
                </span>
              </div>

              <div style={styles.studentsGrid}>
                {stageStudents.map((student) => {
                  const subs = getStudentSubmissions(student.id);
                  const atts = getStudentAttempts(student.id);
                  const avg = getAverageScore(student.id);
                  const gradeModules = modules.filter(
                    (m) => String(m.grade) === String(student.grade),
                  );

                  return (
                    <div
                      key={student.id}
                      style={{
                        ...styles.studentCard,
                        borderTop: `3px solid ${stageData.color}`,
                      }}
                      onClick={() =>
                        setSelectedStudent(
                          selectedStudent && selectedStudent.id === student.id
                            ? null
                            : student,
                        )
                      }
                    >
                      <div style={styles.studentCardTop}>
                        <div
                          style={{
                            ...styles.studentAvatar,
                            background: stageData.bg,
                            color: stageData.color,
                          }}
                        >
                          {student.full_name &&
                            student.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.studentInfo}>
                          <h3 style={styles.studentName}>
                            {student.full_name}
                          </h3>
                          <p style={styles.studentGrade}>
                            Grade {student.grade} • {stageName}
                          </p>
                        </div>
                        <span
                          style={{
                            ...styles.gradePill,
                            background: stageData.bg,
                            color: stageData.color,
                          }}
                        >
                          Gr. {student.grade}
                        </span>
                      </div>

                      <div style={styles.studentStats}>
                        <div style={styles.studentStat}>
                          <span style={styles.studentStatNum}>{subs}</span>
                          <span style={styles.studentStatLabel}>Submitted</span>
                        </div>
                        <div style={styles.studentStatDivider} />
                        <div style={styles.studentStat}>
                          <span style={styles.studentStatNum}>{atts}</span>
                          <span style={styles.studentStatLabel}>Quizzes</span>
                        </div>
                        <div style={styles.studentStatDivider} />
                        <div style={styles.studentStat}>
                          <span
                            style={{
                              ...styles.studentStatNum,
                              color: avg ? getScoreColor(avg) : "#aaa",
                            }}
                          >
                            {avg ? avg + "%" : "N/A"}
                          </span>
                          <span style={styles.studentStatLabel}>Avg Score</span>
                        </div>
                      </div>

                      {selectedStudent && selectedStudent.id === student.id && (
                        <div style={styles.expandedSection}>
                          <div style={styles.expandedDivider} />
                          <h4 style={styles.expandedTitle}>
                            📚 Available Modules for Grade {student.grade}
                          </h4>
                          {gradeModules.length === 0 ? (
                            <p style={styles.expandedEmpty}>
                              No modules uploaded for Grade {student.grade} yet
                            </p>
                          ) : (
                            <div style={styles.modulesList}>
                              {gradeModules.map((m) => (
                                <div key={m.id} style={styles.moduleItem}>
                                  <div
                                    style={{
                                      ...styles.moduleIcon,
                                      background: stageData.bg,
                                    }}
                                  >
                                    📖
                                  </div>
                                  <div style={styles.moduleInfo}>
                                    <p style={styles.moduleTitle}>{m.title}</p>
                                    <p style={styles.moduleSub}>{m.subject}</p>
                                  </div>
                                  {m.file_url && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(m.file_url, "_blank");
                                      }}
                                      style={styles.moduleBtn}
                                    >
                                      View
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={styles.expandedActions}>
                            <button
                              style={styles.chatBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/chat");
                              }}
                            >
                              💬 Message Student
                            </button>
                            <button
                              style={styles.assignBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/assignments");
                              }}
                            >
                              📝 View Assignments
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
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
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  pageDesc: { fontSize: "14px", color: "#888" },
  statsRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  stageStatCard: {
    flex: 1,
    minWidth: "140px",
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  filterRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1.5px solid #e0e0e0",
    fontSize: "14px",
    width: "240px",
    outline: "none",
  },
  stagePills: { display: "flex", gap: "8px", flexWrap: "wrap" },
  pill: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "500",
  },
  stageSection: { marginBottom: "32px" },
  stageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  stageHeaderLeft: { display: "flex", alignItems: "center", gap: "12px" },
  countBadge: {
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
  },
  studentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px",
  },
  studentCard: {
    background: "white",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  studentCardTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  studentAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
    flexShrink: 0,
  },
  studentInfo: { flex: 1 },
  studentName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "2px",
  },
  studentGrade: { fontSize: "12px", color: "#888" },
  gradePill: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },
  studentStats: {
    display: "flex",
    background: "#f8f9ff",
    borderRadius: "10px",
    padding: "12px",
  },
  studentStat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  studentStatNum: { fontSize: "20px", fontWeight: "800", color: "#1a1a2e" },
  studentStatLabel: { fontSize: "10px", color: "#aaa", fontWeight: "500" },
  studentStatDivider: { width: "1px", background: "#e0e0e0", margin: "0 8px" },
  expandedSection: { marginTop: "16px" },
  expandedDivider: {
    height: "1px",
    background: "#f0f0f0",
    marginBottom: "16px",
  },
  expandedTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "12px",
  },
  expandedEmpty: {
    fontSize: "13px",
    color: "#aaa",
    textAlign: "center",
    padding: "12px",
  },
  modulesList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  },
  moduleItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px",
    background: "#f8f9ff",
    borderRadius: "8px",
  },
  moduleIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: "13px", fontWeight: "600", color: "#1a1a2e" },
  moduleSub: { fontSize: "11px", color: "#888" },
  moduleBtn: {
    background: "#ede7f6",
    color: "#5c6bc0",
    border: "none",
    padding: "4px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  expandedActions: { display: "flex", gap: "8px" },
  chatBtn: {
    flex: 1,
    padding: "8px",
    background: "#e3f2fd",
    color: "#1e88e5",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  assignBtn: {
    flex: 1,
    padding: "8px",
    background: "#e8f5e9",
    color: "#43a047",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  empty: { textAlign: "center", padding: "60px 20px" },
  profileCard: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "500px",
    margin: "0 auto",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
  },
  profileAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#ede7f6",
    color: "#5c6bc0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "32px",
    margin: "0 auto 16px",
  },
  profileName: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  profileGrade: {
    fontSize: "15px",
    color: "#5c6bc0",
    fontWeight: "600",
    marginBottom: "24px",
  },
  profileStats: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "32px",
    marginBottom: "24px",
  },
  profileStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  profileStatNum: { fontSize: "28px", fontWeight: "800", color: "#1a1a2e" },
  profileStatLabel: { fontSize: "12px", color: "#888" },
  profileStatDivider: { width: "1px", height: "40px", background: "#e0e0e0" },
  stageCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#f8f9ff",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px",
    textAlign: "left",
  },
  viewModulesBtn: {
    background: "#5c6bc0",
    color: "white",
    border: "none",
    padding: "12px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
};
