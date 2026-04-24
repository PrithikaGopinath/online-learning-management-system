import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const CURRICULUM = {
  "Primary (Grades 1-5)": {
    grades: ["1", "2", "3", "4", "5"],
    color: { bg: "#e8f5e9", text: "#2e7d32", border: "#4caf50" },
    icon: "🌱",
    subjects: [
      "English",
      "Mathematics",
      "Science",
      "History",
      "Geography",
      "Art & Design",
      "Music",
      "Physical Education",
      "Computing",
      "Design & Technology",
      "Religious Education",
      "Foreign Languages",
    ],
  },
  "Lower Secondary (Grades 6-8)": {
    grades: ["6", "7", "8"],
    color: { bg: "#e3f2fd", text: "#1565c0", border: "#2196f3" },
    icon: "📘",
    subjects: [
      "English Language & Literature",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "Geography",
      "History",
      "Computing",
      "Design & Technology",
      "Art & Design",
      "Music",
      "Physical Education",
      "Citizenship",
      "French",
      "Spanish",
      "German",
    ],
  },
  "Upper Secondary GCSE (Grades 9-10)": {
    grades: ["9", "10"],
    color: { bg: "#fff3e0", text: "#e65100", border: "#ff9800" },
    icon: "📙",
    subjects: [
      "English Language",
      "English Literature",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "Geography",
      "History",
      "Computer Science",
      "Business Studies",
      "Economics",
      "Art",
      "Drama",
      "Music",
      "Design & Technology",
      "Food Technology",
      "Physical Education",
      "Foreign Language",
    ],
  },
  "Sixth Form A-Level (Grades 11-12)": {
    grades: ["11", "12"],
    color: { bg: "#f3e5f5", text: "#6a1b9a", border: "#9c27b0" },
    icon: "🎓",
    subjects: [
      "Mathematics",
      "Further Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "Economics",
      "Psychology",
      "History",
      "Geography",
      "English Literature",
      "Business Studies",
      "Law",
      "Art",
      "Sociology",
    ],
  },
};

const getStage = (grade) => {
  const g = String(grade);
  if (["1", "2", "3", "4", "5"].includes(g)) return "Primary (Grades 1-5)";
  if (["6", "7", "8"].includes(g)) return "Lower Secondary (Grades 6-8)";
  if (["9", "10"].includes(g)) return "Upper Secondary GCSE (Grades 9-10)";
  return "Sixth Form A-Level (Grades 11-12)";
};

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState("Primary (Grades 1-5)");
  const [subject, setSubject] = useState("English");
  const [grade, setGrade] = useState("1");
  const [file, setFile] = useState(null);
  const [filterStage, setFilterStage] = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");

  const fetchModules = async (profileData) => {
    let query = supabase
      .from("modules")
      .select("*")
      .order("created_at", { ascending: false });
    if (profileData && profileData.role === "student") {
      query = query.eq("grade", profileData.grade);
    } else if (profileData && profileData.role === "tutor") {
      const assignedGrades = profileData.assigned_grades || [];
      if (assignedGrades.length > 0) {
        query = query.in("grade", assignedGrades);
      }
    }
    const { data } = await query;
    setModules(data || []);
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
      await fetchModules(profileData);
      setLoading(false);
    };
    getData();
  }, []);

  const handleStageChange = (newStage) => {
    setStage(newStage);
    setSubject(CURRICULUM[newStage].subjects[0]);
    setGrade(CURRICULUM[newStage].grades[0]);
  };

  const getAvailableGrades = () => {
    if (
      profile &&
      profile.role === "tutor" &&
      profile.assigned_grades &&
      profile.assigned_grades.length > 0
    ) {
      return CURRICULUM[stage].grades.filter((g) =>
        profile.assigned_grades.includes(g),
      );
    }
    return CURRICULUM[stage].grades;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let fileUrl = null;
      if (file) {
        const fileName = Date.now() + "." + file.name.split(".").pop();
        const { error: uploadError } = await supabase.storage
          .from("modules")
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("modules")
          .getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from("modules").insert({
        title,
        description,
        subject,
        grade,
        file_url: fileUrl,
        created_by: user.id,
      });
      if (error) throw error;
      setMessage("Module uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      setShowForm(false);
      await fetchModules(profile);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setUploading(false);
  };

  const filteredModules = modules.filter((mod) => {
    if (filterStage !== "All" && getStage(mod.grade) !== filterStage)
      return false;
    if (filterSubject !== "All" && mod.subject !== filterSubject) return false;
    return true;
  });

  const grouped = {};
  filteredModules.forEach((mod) => {
    const s = getStage(mod.grade);
    if (!grouped[s]) grouped[s] = [];
    grouped[s].push(mod);
  });

  if (loading) return <div style={styles.loading}>Loading modules...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📚 Modules</h1>
          <p style={styles.subtitle}>
            {profile &&
            profile.role === "tutor" &&
            profile.assigned_grades &&
            profile.assigned_grades.length > 0
              ? `Your Grades: ${profile.assigned_grades.sort((a, b) => Number(a) - Number(b)).join(", ")}`
              : "UK Curriculum — Grades 1 to 12"}
          </p>
        </div>
        {profile && profile.role === "tutor" && (
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Upload Module"}
          </button>
        )}
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {showForm && profile && profile.role === "tutor" && (
        <div style={styles.form}>
          <h2 style={styles.formTitle}>Upload New Module</h2>
          <form onSubmit={handleUpload}>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Introduction to Algebra"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              placeholder="What will students learn?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <label style={styles.label}>School Stage</label>
            <select
              style={styles.input}
              value={stage}
              onChange={(e) => handleStageChange(e.target.value)}
            >
              {Object.keys(CURRICULUM).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <label style={styles.label}>Subject</label>
            <select
              style={styles.input}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {CURRICULUM[stage].subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
            <label style={styles.label}>Upload File</label>
            <input
              style={styles.input}
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4"
            />
            <button style={styles.submitBtn} type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Module"}
            </button>
          </form>
        </div>
      )}

      <div style={styles.stageTabs}>
        {Object.entries(CURRICULUM).map(([name, data]) => (
          <div
            key={name}
            onClick={() => {
              setFilterStage(filterStage === name ? "All" : name);
              setFilterSubject("All");
            }}
            style={{
              flex: 1,
              padding: "16px 8px",
              cursor: "pointer",
              textAlign: "center",
              background: filterStage === name ? data.color.bg : "white",
              borderBottom:
                filterStage === name
                  ? `3px solid ${data.color.border}`
                  : "3px solid transparent",
              color: filterStage === name ? data.color.text : "#666",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "4px" }}>
              {data.icon}
            </div>
            <div style={{ fontSize: "11px", fontWeight: "600" }}>{name}</div>
          </div>
        ))}
      </div>

      {filterStage !== "All" && (
        <div style={styles.pillsBox}>
          <div style={styles.pillsRow}>
            <span
              onClick={() => setFilterSubject("All")}
              style={{
                ...styles.pill,
                background: filterSubject === "All" ? "#667eea" : "#f0f0f0",
                color: filterSubject === "All" ? "white" : "#333",
              }}
            >
              All
            </span>
            {CURRICULUM[filterStage].subjects.map((s) => (
              <span
                key={s}
                onClick={() => setFilterSubject(s)}
                style={{
                  ...styles.pill,
                  background: filterSubject === s ? "#667eea" : "#f0f0f0",
                  color: filterSubject === s ? "white" : "#333",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
          <p style={{ color: "#666", fontSize: "18px" }}>No modules yet</p>
          {profile && profile.role === "tutor" && (
            <p style={{ color: "#aaa", fontSize: "14px", marginTop: "8px" }}>
              Click Upload Module to add the first one!
            </p>
          )}
        </div>
      ) : (
        Object.entries(CURRICULUM).map(([stageName, stageData]) => {
          const mods = grouped[stageName];
          if (!mods || mods.length === 0) return null;
          const c = stageData.color;
          return (
            <div key={stageName} style={{ marginBottom: "32px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  background: c.bg,
                  borderLeft: `5px solid ${c.border}`,
                }}
              >
                <h2
                  style={{ fontSize: "18px", fontWeight: "700", color: c.text }}
                >
                  {stageData.icon} {stageName}
                </h2>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: c.border,
                    color: "white",
                  }}
                >
                  {mods.length} {mods.length === 1 ? "module" : "modules"}
                </span>
              </div>
              <div style={styles.grid}>
                {mods.map((mod) => {
                  const mc = CURRICULUM[getStage(mod.grade)].color;
                  return (
                    <div
                      key={mod.id}
                      style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                        borderTop: `4px solid ${mc.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: mc.bg,
                            color: mc.text,
                          }}
                        >
                          {mod.subject}
                        </span>
                        <span
                          style={{
                            background: "#f5f5f5",
                            color: "#666",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                          }}
                        >
                          Grade {mod.grade}
                        </span>
                      </div>
                      <h3
                        style={{
                          fontSize: "16px",
                          color: "#333",
                          marginBottom: "8px",
                          fontWeight: "600",
                        }}
                      >
                        {mod.title}
                      </h3>
                      {mod.description && (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#666",
                            marginBottom: "12px",
                            lineHeight: "1.6",
                          }}
                        >
                          {mod.description}
                        </p>
                      )}
                      {mod.file_url && (
                        <button
                          onClick={() => window.open(mod.file_url, "_blank")}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "10px",
                            borderRadius: "8px",
                            textAlign: "center",
                            fontWeight: "500",
                            fontSize: "14px",
                            marginTop: "12px",
                            background: mc.bg,
                            color: mc.text,
                            border: `1px solid ${mc.border}`,
                            cursor: "pointer",
                          }}
                        >
                          📥 Download Material
                        </button>
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
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto" },
  loading: { textAlign: "center", padding: "40px", fontSize: "18px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  title: { fontSize: "28px", color: "#333", marginBottom: "4px" },
  subtitle: { fontSize: "14px", color: "#888" },
  addBtn: {
    background: "#5c6bc0",
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
    background: "#5c6bc0",
    color: "white",
    border: "none",
    padding: "12px 28px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  stageTabs: {
    display: "flex",
    marginTop: "24px",
    marginBottom: "24px",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  pillsBox: {
    background: "white",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  pillsRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  pill: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  empty: { textAlign: "center", padding: "60px 20px" },
};
