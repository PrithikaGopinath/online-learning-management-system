import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [grade, setGrade] = useState("all");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchAnnouncements = async (profileData) => {
    let query = supabase
      .from("announcements")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });
    if (profileData && profileData.role === "student") {
      query = query.or(`grade.eq.all,grade.eq.${profileData.grade}`);
    }
    const { data } = await query;
    setAnnouncements(data || []);
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
      await fetchAnnouncements(profileData);
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
      const { error } = await supabase.from("announcements").insert({
        title,
        content,
        grade,
        created_by: user.id,
      });
      if (error) throw error;
      setMessage("Announcement posted!");
      setTitle("");
      setContent("");
      setGrade("all");
      setShowForm(false);
      await fetchAnnouncements(profile);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setPosting(false);
  };

  const handleDelete = async (id) => {
    await supabase.from("announcements").delete().eq("id", id);
    await fetchAnnouncements(profile);
  };

  if (loading)
    return <div style={styles.loading}>Loading announcements...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📢 Announcements</h1>
          <p style={styles.subtitle}>Important notices from your tutors</p>
        </div>
        {profile && profile.role === "tutor" && (
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Announcement"}
          </button>
        )}
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {showForm && profile && profile.role === "tutor" && (
        <div style={styles.form}>
          <h2 style={styles.formTitle}>Post Announcement</h2>
          <form onSubmit={handlePost}>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Exam next Monday!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label style={styles.label}>Message</label>
            <textarea
              style={styles.textarea}
              placeholder="Write your announcement..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
            <label style={styles.label}>Send to</label>
            <select
              style={styles.input}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="all">📣 All Students</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>
                  Grade {g} only
                </option>
              ))}
            </select>
            <button style={styles.submitBtn} type="submit" disabled={posting}>
              {posting ? "Posting..." : "Post Announcement"}
            </button>
          </form>
        </div>
      )}

      {announcements.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ fontSize: "48px", marginBottom: "12px" }}>📭</p>
          <p style={{ color: "#666", fontSize: "18px" }}>
            No announcements yet
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {announcements.map((ann, i) => (
            <div
              key={ann.id}
              style={{
                ...styles.card,
                borderLeft: i === 0 ? "5px solid #667eea" : "5px solid #ddd",
              }}
            >
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>
                    {i === 0 ? "🔔 " : "📌 "}
                    {ann.title}
                  </h3>
                  <div style={styles.meta}>
                    <span style={styles.metaItem}>
                      👤 {ann.profiles && ann.profiles.full_name}
                    </span>
                    <span style={styles.metaItem}>
                      📅 {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                    <span
                      style={{
                        ...styles.gradeBadge,
                        background: ann.grade === "all" ? "#e3f2fd" : "#f3e5f5",
                        color: ann.grade === "all" ? "#1565c0" : "#6a1b9a",
                      }}
                    >
                      {ann.grade === "all"
                        ? "📣 All Students"
                        : `Grade ${ann.grade}`}
                    </span>
                  </div>
                </div>
                {profile && profile.role === "tutor" && (
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(ann.id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
              <p style={styles.cardContent}>{ann.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "900px", margin: "0 auto" },
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
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "18px",
    color: "#333",
    marginBottom: "8px",
    fontWeight: "600",
  },
  meta: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  metaItem: { fontSize: "13px", color: "#888" },
  gradeBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardContent: { fontSize: "15px", color: "#555", lineHeight: "1.7" },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },
  empty: { textAlign: "center", padding: "60px 20px" },
};
