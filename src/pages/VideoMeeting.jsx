import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

export default function VideoMeeting() {
  const [profile, setProfile] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [meetingGrade, setMeetingGrade] = useState("1");
  const [scheduledAt, setScheduledAt] = useState("");
  const [quickRoom, setQuickRoom] = useState("");

  const fetchMeetings = async () => {
    const { data } = await supabase
      .from("meetings")
      .select("*")
      .order("scheduled_at", { ascending: false });
    setMeetings(data || []);
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
      await fetchMeetings();
      setLoading(false);
    };
    getData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const roomName = `learnhub-grade${meetingGrade}-${Date.now()}`;
      const { error } = await supabase.from("meetings").insert({
        title,
        grade: meetingGrade,
        room_name: roomName,
        scheduled_at: scheduledAt,
        created_by: user.id,
      });
      if (error) throw error;
      setMessage("Meeting created!");
      setTitle("");
      setMeetingGrade("1");
      setScheduledAt("");
      setShowForm(false);
      await fetchMeetings();
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  if (loading) return <div style={styles.loading}>Loading meetings...</div>;

  if (activeRoom) {
    return (
      <div style={styles.meetingWrapper}>
        <div style={styles.meetingBar}>
          <h2 style={styles.meetingBarTitle}>🎥 {activeRoom.title}</h2>
          <button style={styles.leaveBtn} onClick={() => setActiveRoom(null)}>
            Leave Meeting
          </button>
        </div>
        <iframe
          title="Video Meeting"
          src={`https://meet.jit.si/${activeRoom.room_name}`}
          style={styles.iframe}
          allow="camera; microphone; fullscreen; display-capture"
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎥 Video Meetings</h1>
          <p style={styles.subtitle}>Join or schedule live classes</p>
        </div>
        {profile && profile.role === "tutor" && (
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Schedule Meeting"}
          </button>
        )}
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {showForm && profile && profile.role === "tutor" && (
        <div style={styles.form}>
          <h2 style={styles.formTitle}>Schedule New Meeting</h2>
          <form onSubmit={handleCreate}>
            <label style={styles.label}>Meeting Title</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Grade 5 Maths Revision"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label style={styles.label}>Grade</label>
            <select
              style={styles.input}
              value={meetingGrade}
              onChange={(e) => setMeetingGrade(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
            <label style={styles.label}>Date & Time</label>
            <input
              style={styles.input}
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
            <button style={styles.submitBtn} type="submit">
              Schedule Meeting
            </button>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {meetings.map((meeting) => (
          <div key={meeting.id} style={styles.card}>
            <div style={styles.cardIcon}>🎥</div>
            <h3 style={styles.cardTitle}>{meeting.title}</h3>
            <div style={styles.cardMeta}>
              <span style={styles.badge}>Grade {meeting.grade}</span>
              <span style={styles.badge}>
                {meeting.scheduled_at
                  ? new Date(meeting.scheduled_at).toLocaleString()
                  : "Now"}
              </span>
            </div>
            <button
              style={styles.joinBtn}
              onClick={() => setActiveRoom(meeting)}
            >
              🚀 Join Meeting
            </button>
          </div>
        ))}
      </div>

      <div style={styles.quickJoin}>
        <h2 style={styles.quickTitle}>⚡ Quick Join</h2>
        <p style={styles.quickDesc}>Enter any room name to join instantly</p>
        <div style={styles.quickRow}>
          <input
            style={styles.quickInput}
            type="text"
            placeholder="Enter room name..."
            value={quickRoom}
            onChange={(e) => setQuickRoom(e.target.value)}
          />
          <button
            style={styles.quickBtn}
            onClick={() => {
              if (quickRoom.trim())
                setActiveRoom({
                  title: "Quick Join",
                  room_name: quickRoom.trim(),
                });
            }}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "32px", maxWidth: "1200px", margin: "0 auto" },
  loading: { textAlign: "center", padding: "40px", fontSize: "18px" },
  meetingWrapper: {
    height: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
  },
  meetingBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    background: "#667eea",
  },
  meetingBarTitle: { color: "white", fontSize: "18px" },
  leaveBtn: {
    background: "#e53e3e",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  iframe: { flex: 1, border: "none", width: "100%" },
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  card: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    borderTop: "4px solid #667eea",
  },
  cardIcon: { fontSize: "32px", marginBottom: "12px" },
  cardTitle: {
    fontSize: "18px",
    color: "#333",
    marginBottom: "12px",
    fontWeight: "600",
  },
  cardMeta: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  badge: {
    background: "#f0f0ff",
    color: "#667eea",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  joinBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  quickJoin: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  quickTitle: { fontSize: "18px", color: "#333", marginBottom: "8px" },
  quickDesc: { color: "#666", fontSize: "14px", marginBottom: "16px" },
  quickRow: { display: "flex", gap: "12px" },
  quickInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
  },
  quickBtn: {
    background: "#667eea",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
};
