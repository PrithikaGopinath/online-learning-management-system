import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("1");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [posting, setPosting] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState(null);

  const fetchData = async (profileData, userId) => {
    if (profileData && profileData.role === "student") {
      const { data: a } = await supabase
        .from("assignments")
        .select("*")
        .eq("grade", profileData.grade)
        .order("due_date", { ascending: true });
      setAssignments(a || []);
      const { data: s } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", userId);
      setSubmissions(s || []);
    } else {
      const assignedGrades = profileData.assigned_grades || [];
      let assignQuery = supabase
        .from("assignments")
        .select("*")
        .order("created_at", { ascending: false });
      if (assignedGrades.length > 0) {
        assignQuery = assignQuery.in("grade", assignedGrades);
      } else {
        assignQuery = assignQuery.eq("created_by", userId);
      }
      const { data: a } = await assignQuery;
      setAssignments(a || []);
      const { data: s } = await supabase
        .from("submissions")
        .select("*, profiles(full_name)")
        .order("submitted_at", { ascending: false });
      setSubmissions(s || []);
    }
  };

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
      await fetchData(profileData, user.id);
      setLoading(false);
    };
    getData();
  }, []);

  const getAvailableGrades = () => {
    if (
      profile &&
      profile.assigned_grades &&
      profile.assigned_grades.length > 0
    ) {
      return profile.assigned_grades.sort((a, b) => Number(a) - Number(b));
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(String);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("assignments").insert({
        title,
        description,
        subject,
        grade,
        due_date: dueDate,
        created_by: user.id,
      });
      if (error) throw error;
      setMessage("✅ Assignment posted successfully!");
      setTitle("");
      setDescription("");
      setSubject("");
      setDueDate("");
      setShowForm(false);
      await fetchData(profile, user.id);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setPosting(false);
  };

  const handleSubmit = async (assignmentId) => {
    if (!file) {
      setMessage("Please select a file");
      return;
    }
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const fileName = Date.now() + "." + file.name.split(".").pop();
      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("submissions")
        .getPublicUrl(fileName);
      const { error } = await supabase.from("submissions").insert({
        assignment_id: assignmentId,
        student_id: user.id,
        file_url: urlData.publicUrl,
      });
      if (error) throw error;
      setMessage("✅ Assignment submitted successfully!");
      setFile(null);
      setSelectedAssignment(null);
      await fetchData(profile, user.id);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setSubmitting(false);
  };

  const handleGrade = async (submissionId) => {
    if (!gradeInput) {
      setMessage("Please enter a grade");
      return;
    }
    setSavingGrade(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          grade: gradeInput,
          feedback: feedbackInput,
          graded_at: new Date().toISOString(),
        })
        .eq("id", submissionId);
      if (error) throw error;
      setMessage("✅ Grade saved successfully!");
      setGradingSubmission(null);
      setGradeInput("");
      setFeedbackInput("");
      await fetchData(profile, profile.id);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setSavingGrade(false);
  };

  const isSubmitted = (id) => submissions.some((s) => s.assignment_id === id);
  const getMySubmission = (id) =>
    submissions.find((s) => s.assignment_id === id);

  if (loading) return <div style={styles.loading}>Loading assignments...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📝 Assignments</h1>
          <p style={styles.subtitle}>
            {profile &&
            profile.role === "tutor" &&
            profile.assigned_grades &&
            profile.assigned_grades.length > 0
              ? `Your Grades: ${profile.assigned_grades.sort((a, b) => Number(a) - Number(b)).join(", ")}`
              : profile && profile.role === "student"
                ? "View and submit your assignments"
                : "Post and manage assignments"}
          </p>
        </div>
        {profile && profile.role === "tutor" && (
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Post Assignment"}
          </button>
        )}
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {showForm && profile && profile.role === "tutor" && (
        <div style={styles.form}>
          <h2 style={styles.formTitle}>Post New Assignment</h2>
          <form onSubmit={handlePost}>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Assignment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label style={styles.label}>Description / Instructions</label>
            <textarea
              style={styles.textarea}
              placeholder="Instructions for students..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <label style={styles.label}>Subject</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <label style={styles.label}>Grade</label>
            <select
              style={styles.input}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              {getAvailableGrades().map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
            <label style={styles.label}>Due Date</label>
            <input
              style={styles.input}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <button style={styles.submitBtn} type="submit" disabled={posting}>
              {posting ? "Posting..." : "Post Assignment"}
            </button>
          </form>
        </div>
      )}

      <div style={styles.list}>
        {assignments.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "48px", marginBottom: "12px" }}>📋</p>
            <p style={{ color: "#666", fontSize: "18px" }}>
              No assignments yet
            </p>
          </div>
        ) : (
          assignments.map((a) => {
            const submitted = isSubmitted(a.id);
            const mySubmission = getMySubmission(a.id);
            const overdue = new Date(a.due_date) < new Date() && !submitted;
            const assignmentSubmissions = submissions.filter(
              (s) => s.assignment_id === a.id,
            );
            const isExpanded = expandedAssignment === a.id;

            return (
              <div
                key={a.id}
                style={{
                  ...styles.card,
                  borderLeft: `5px solid ${submitted ? "#4caf50" : overdue ? "#f44336" : "#5c6bc0"}`,
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderLeft}>
                    <h3 style={styles.cardTitle}>{a.title}</h3>
                    <p style={styles.cardDesc}>{a.description}</p>
                    <div style={styles.cardMeta}>
                      <span style={styles.badge}>{a.subject}</span>
                      <span style={styles.badge}>Grade {a.grade}</span>
                      <span
                        style={{
                          ...styles.badge,
                          background: "#fff3e0",
                          color: "#e65100",
                        }}
                      >
                        📅 Due: {a.due_date}
                      </span>
                      {profile && profile.role === "student" && (
                        <span
                          style={{
                            ...styles.badge,
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
                            ? "✅ Submitted"
                            : overdue
                              ? "⚠️ Overdue"
                              : "⏳ Pending"}
                        </span>
                      )}
                      {profile && profile.role === "tutor" && (
                        <span
                          style={{
                            ...styles.badge,
                            background: "#e8f5e9",
                            color: "#2e7d32",
                          }}
                        >
                          📬 {assignmentSubmissions.length} submissions
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    {profile &&
                      profile.role === "student" &&
                      !submitted &&
                      (selectedAssignment === a.id ? (
                        <div style={styles.submitBox}>
                          <input
                            style={styles.fileInput}
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                          />
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginTop: "8px",
                            }}
                          >
                            <button
                              style={styles.submitFileBtn}
                              onClick={() => handleSubmit(a.id)}
                              disabled={submitting}
                            >
                              {submitting ? "Submitting..." : "Submit"}
                            </button>
                            <button
                              style={styles.cancelBtn}
                              onClick={() => setSelectedAssignment(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          style={styles.submitBtn2}
                          onClick={() => setSelectedAssignment(a.id)}
                        >
                          📤 Submit Assignment
                        </button>
                      ))}

                    {profile &&
                      profile.role === "tutor" &&
                      assignmentSubmissions.length > 0 && (
                        <button
                          style={styles.viewSubBtn}
                          onClick={() =>
                            setExpandedAssignment(isExpanded ? null : a.id)
                          }
                        >
                          {isExpanded
                            ? "Hide Submissions ▲"
                            : "View Submissions ▼"}
                        </button>
                      )}
                  </div>
                </div>

                {profile &&
                  profile.role === "student" &&
                  submitted &&
                  mySubmission && (
                    <div style={styles.submissionStatus}>
                      <div style={styles.submissionStatusRow}>
                        <div>
                          <p style={styles.submittedText}>
                            ✅ Submitted successfully
                          </p>
                          <p style={styles.submittedDate}>
                            {new Date(
                              mySubmission.submitted_at,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {mySubmission.file_url && (
                          <button
                            onClick={() =>
                              window.open(mySubmission.file_url, "_blank")
                            }
                            style={styles.viewFileBtn}
                          >
                            📄 View Submission
                          </button>
                        )}
                      </div>

                      {mySubmission.grade ? (
                        <div style={styles.gradeBox}>
                          <div style={styles.gradeBoxHeader}>
                            <span style={styles.gradeBoxTitle}>
                              📊 Your Grade
                            </span>
                            <span style={styles.gradeValue}>
                              {mySubmission.grade}
                            </span>
                          </div>
                          {mySubmission.feedback && (
                            <div style={styles.feedbackBox}>
                              <p style={styles.feedbackLabel}>
                                💬 Tutor Feedback:
                              </p>
                              <p style={styles.feedbackText}>
                                {mySubmission.feedback}
                              </p>
                            </div>
                          )}
                          <p style={styles.gradedDate}>
                            Graded on{" "}
                            {new Date(
                              mySubmission.graded_at,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div style={styles.pendingGrade}>
                          <p>⏳ Awaiting grade from tutor</p>
                        </div>
                      )}
                    </div>
                  )}

                {profile && profile.role === "tutor" && isExpanded && (
                  <div style={styles.submissionsPanel}>
                    <h4 style={styles.submissionsPanelTitle}>
                      📬 Submissions ({assignmentSubmissions.length})
                    </h4>
                    {assignmentSubmissions.length === 0 ? (
                      <p style={styles.noSubmissions}>No submissions yet</p>
                    ) : (
                      assignmentSubmissions.map((sub) => (
                        <div key={sub.id} style={styles.submissionRow}>
                          <div style={styles.submissionLeft}>
                            <div style={styles.submissionAvatar}>
                              {sub.profiles &&
                                sub.profiles.full_name &&
                                sub.profiles.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={styles.submissionName}>
                                {sub.profiles && sub.profiles.full_name}
                              </p>
                              <p style={styles.submissionDate}>
                                Submitted:{" "}
                                {new Date(
                                  sub.submitted_at,
                                ).toLocaleDateString()}
                              </p>
                              {sub.grade && (
                                <p style={styles.submissionGradeTag}>
                                  Grade: <strong>{sub.grade}</strong>
                                  {sub.graded_at &&
                                    ` • Graded ${new Date(sub.graded_at).toLocaleDateString()}`}
                                </p>
                              )}
                              {sub.feedback && (
                                <p style={styles.submissionFeedbackTag}>
                                  Feedback: {sub.feedback}
                                </p>
                              )}
                            </div>
                          </div>

                          <div style={styles.submissionRight}>
                            {sub.file_url && (
                              <button
                                onClick={() =>
                                  window.open(sub.file_url, "_blank")
                                }
                                style={styles.viewBtn}
                              >
                                📄 View
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setGradingSubmission(
                                  gradingSubmission === sub.id ? null : sub.id,
                                );
                                setGradeInput(sub.grade || "");
                                setFeedbackInput(sub.feedback || "");
                              }}
                              style={{
                                ...styles.gradeBtn,
                                background: sub.grade ? "#e8f5e9" : "#5c6bc0",
                                color: sub.grade ? "#2e7d32" : "white",
                              }}
                            >
                              {sub.grade ? "✏️ Edit Grade" : "📊 Grade"}
                            </button>
                          </div>

                          {gradingSubmission === sub.id && (
                            <div style={styles.gradeForm}>
                              <div style={styles.gradeFormRow}>
                                <div style={styles.gradeInputBox}>
                                  <label style={styles.gradeLabel}>Grade</label>
                                  <select
                                    style={styles.gradeSelect}
                                    value={gradeInput}
                                    onChange={(e) =>
                                      setGradeInput(e.target.value)
                                    }
                                  >
                                    <option value="">Select grade</option>
                                    <option value="A*">A*</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                    <option value="E">E</option>
                                    <option value="U">U</option>
                                    <option value="100%">100%</option>
                                    <option value="90%">90%</option>
                                    <option value="80%">80%</option>
                                    <option value="70%">70%</option>
                                    <option value="60%">60%</option>
                                    <option value="50%">50%</option>
                                    <option value="Below 50%">Below 50%</option>
                                  </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={styles.gradeLabel}>
                                    Feedback for student
                                  </label>
                                  <textarea
                                    style={styles.feedbackInput}
                                    placeholder="Write feedback for the student..."
                                    value={feedbackInput}
                                    onChange={(e) =>
                                      setFeedbackInput(e.target.value)
                                    }
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <div style={styles.gradeFormBtns}>
                                <button
                                  style={styles.saveGradeBtn}
                                  onClick={() => handleGrade(sub.id)}
                                  disabled={savingGrade}
                                >
                                  {savingGrade ? "Saving..." : "💾 Save Grade"}
                                </button>
                                <button
                                  style={styles.cancelGradeBtn}
                                  onClick={() => setGradingSubmission(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto" },
  loading: { textAlign: "center", padding: "40px", fontSize: "18px" },
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
  addBtn: {
    background: "#5c6bc0",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  message: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontWeight: "500",
  },
  form: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
  },
  formTitle: {
    fontSize: "18px",
    color: "#1a1a2e",
    marginBottom: "20px",
    fontWeight: "700",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1.5px solid #e0e0e0",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1.5px solid #e0e0e0",
    fontSize: "15px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  submitBtn: {
    background: "#5c6bc0",
    color: "white",
    border: "none",
    padding: "12px 28px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  card: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f0f0f0",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  cardHeaderLeft: { flex: 1 },
  cardActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
    minWidth: "180px",
  },
  cardTitle: {
    fontSize: "18px",
    color: "#1a1a2e",
    marginBottom: "8px",
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "12px",
    lineHeight: "1.5",
  },
  cardMeta: { display: "flex", gap: "8px", flexWrap: "wrap" },
  badge: {
    background: "#f0f0ff",
    color: "#5c6bc0",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  submitBtn2: {
    background: "#5c6bc0",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  submitBox: { textAlign: "right" },
  fileInput: { display: "block", fontSize: "13px", marginBottom: "4px" },
  submitFileBtn: {
    background: "#5c6bc0",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  cancelBtn: {
    background: "#f0f0f0",
    color: "#333",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  viewSubBtn: {
    background: "#f0f0ff",
    color: "#5c6bc0",
    border: "1px solid #c5cae9",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  submissionStatus: {
    marginTop: "16px",
    padding: "16px",
    background: "#f8f9ff",
    borderRadius: "10px",
  },
  submissionStatusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  submittedText: { fontSize: "14px", fontWeight: "600", color: "#2e7d32" },
  submittedDate: { fontSize: "12px", color: "#888", marginTop: "2px" },
  viewFileBtn: {
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  gradeBox: {
    background: "white",
    padding: "16px",
    borderRadius: "10px",
    border: "2px solid #5c6bc0",
  },
  gradeBoxHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  gradeBoxTitle: { fontSize: "14px", fontWeight: "600", color: "#1a1a2e" },
  gradeValue: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#5c6bc0",
    background: "#ede7f6",
    padding: "4px 16px",
    borderRadius: "8px",
  },
  feedbackBox: {
    background: "#f8f9ff",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "8px",
  },
  feedbackLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#5c6bc0",
    marginBottom: "4px",
  },
  feedbackText: { fontSize: "14px", color: "#444", lineHeight: "1.5" },
  gradedDate: { fontSize: "11px", color: "#aaa", marginTop: "8px" },
  pendingGrade: {
    background: "#fff3e0",
    padding: "12px",
    borderRadius: "8px",
    color: "#e65100",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
    marginTop: "8px",
  },
  submissionsPanel: {
    marginTop: "20px",
    padding: "20px",
    background: "#f8f9ff",
    borderRadius: "10px",
    borderTop: "2px solid #e8eaf6",
  },
  submissionsPanelTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: "16px",
  },
  noSubmissions: { color: "#aaa", textAlign: "center", padding: "20px" },
  submissionRow: {
    background: "white",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "12px",
    border: "1px solid #e8eaf6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },
  submissionLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    flex: 1,
  },
  submissionAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#ede7f6",
    color: "#5c6bc0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },
  submissionName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "2px",
  },
  submissionDate: { fontSize: "12px", color: "#888" },
  submissionGradeTag: { fontSize: "12px", color: "#5c6bc0", marginTop: "4px" },
  submissionFeedbackTag: {
    fontSize: "12px",
    color: "#666",
    marginTop: "2px",
    fontStyle: "italic",
  },
  submissionRight: { display: "flex", gap: "8px", alignItems: "center" },
  viewBtn: {
    background: "#e3f2fd",
    color: "#1e88e5",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  gradeBtn: {
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  gradeForm: {
    width: "100%",
    marginTop: "12px",
    padding: "16px",
    background: "#f8f9ff",
    borderRadius: "10px",
    border: "1px solid #e8eaf6",
  },
  gradeFormRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  gradeInputBox: { minWidth: "160px" },
  gradeLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "6px",
  },
  gradeSelect: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1.5px solid #e0e0e0",
    fontSize: "14px",
  },
  feedbackInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1.5px solid #e0e0e0",
    fontSize: "14px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  gradeFormBtns: { display: "flex", gap: "8px" },
  saveGradeBtn: {
    background: "#5c6bc0",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  cancelGradeBtn: {
    background: "#f0f0f0",
    color: "#333",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  empty: { textAlign: "center", padding: "60px 20px" },
};
