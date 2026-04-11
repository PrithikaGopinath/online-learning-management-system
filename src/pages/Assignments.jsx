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
      const { data: a } = await supabase
        .from("assignments")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });
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
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
      await fetchData(profileData, user.id);
      setLoading(false);
    };
    getData();
  }, []);

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
      setMessage("Assignment posted!");
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
      setMessage("Assignment submitted!");
      setFile(null);
      setSelectedAssignment(null);
      await fetchData(profile, user.id);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setSubmitting(false);
  };

  const isSubmitted = (id) => submissions.some((s) => s.assignment_id === id);

  if (loading) return <div style={styles.loading}>Loading assignments...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📝 Assignments</h1>
          <p style={styles.subtitle}>
            {profile && profile.role === "student"
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
            <label style={styles.label}>Description</label>
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
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
            const overdue = new Date(a.due_date) < new Date() && !submitted;
            return (
              <div
                key={a.id}
                style={{
                  ...styles.card,
                  borderLeft: `5px solid ${submitted ? "#4caf50" : overdue ? "#f44336" : "#2196f3"}`,
                }}
              >
                <div style={styles.cardTop}>
                  <div style={styles.cardLeft}>
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
                        Due: {a.due_date}
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
                    </div>
                  </div>
                  <div style={styles.cardRight}>
                    {profile &&
                      profile.role === "student" &&
                      !submitted &&
                      (selectedAssignment === a.id ? (
                        <div>
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
                          Submit Assignment
                        </button>
                      ))}
                    {profile && profile.role === "student" && submitted && (
                      <span
                        style={{
                          color: "#2e7d32",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        ✅ Submitted
                      </span>
                    )}
                    {profile && profile.role === "tutor" && (
                      <div>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#667eea",
                            fontWeight: "600",
                            marginBottom: "8px",
                          }}
                        >
                          {
                            submissions.filter((s) => s.assignment_id === a.id)
                              .length
                          }{" "}
                          submissions
                        </p>
                        {submissions
                          .filter((s) => s.assignment_id === a.id)
                          .map((s) => (
                            <div
                              key={s.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "13px",
                                padding: "4px 0",
                                gap: "8px",
                              }}
                            >
                              <span>{s.profiles && s.profiles.full_name}</span>
                              {s.file_url && (
                                <button
                                  onClick={() =>
                                    window.open(s.file_url, "_blank")
                                  }
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#667eea",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    fontSize: "13px",
                                  }}
                                >
                                  View
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
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
  title: { fontSize: "28px", color: "#333", marginBottom: "4px" },
  subtitle: { fontSize: "14px", color: "#888" },
  addBtn: {
    background: "#667eea",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },
  message: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  form: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  formTitle: { fontSize: "18px", color: "#333", marginBottom: "20px" },
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
    border: "1px solid #ddd",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  submitBtn: {
    background: "#667eea",
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
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  cardLeft: { flex: 1 },
  cardRight: { minWidth: "200px", textAlign: "right" },
  cardTitle: {
    fontSize: "18px",
    color: "#333",
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
    color: "#667eea",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  submitBtn2: {
    background: "#667eea",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  fileInput: { display: "block", fontSize: "13px", marginBottom: "4px" },
  submitFileBtn: {
    background: "#667eea",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  cancelBtn: {
    background: "#eee",
    color: "#333",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  empty: { textAlign: "center", padding: "60px 20px" },
};
