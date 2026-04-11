import React, { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
];

export default function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [grade, setGrade] = useState("1");
  const [day, setDay] = useState("Monday");
  const [timeSlot, setTimeSlot] = useState("8:00 AM");
  const [subject, setSubject] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [filterGrade, setFilterGrade] = useState("1");

  const fetchTimetable = async (g) => {
    const { data } = await supabase
      .from("timetable")
      .select("*")
      .eq("grade", g);
    setTimetable(data || []);
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
      const g =
        profileData && profileData.role === "student" ? profileData.grade : "1";
      setFilterGrade(g);
      await fetchTimetable(g);
      setLoading(false);
    };
    getData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("timetable")
        .insert({
          grade,
          day,
          time_slot: timeSlot,
          subject,
          teacher_name: teacherName,
        });
      if (error) throw error;
      setMessage("Slot added!");
      setSubject("");
      setTeacherName("");
      setShowForm(false);
      await fetchTimetable(filterGrade);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    await supabase.from("timetable").delete().eq("id", id);
    await fetchTimetable(filterGrade);
  };

  const getSlot = (d, t) =>
    timetable.find((s) => s.day === d && s.time_slot === t);

  if (loading) return <div style={styles.loading}>Loading timetable...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 Timetable</h1>
          <p style={styles.subtitle}>Weekly class schedule</p>
        </div>
        <div style={styles.headerRight}>
          <select
            style={styles.gradeSelect}
            value={filterGrade}
            onChange={(e) => {
              setFilterGrade(e.target.value);
              fetchTimetable(e.target.value);
            }}
            disabled={profile && profile.role === "student"}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
          {profile && profile.role === "tutor" && (
            <button
              style={styles.addBtn}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "+ Add Slot"}
            </button>
          )}
        </div>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {showForm && profile && profile.role === "tutor" && (
        <div style={styles.form}>
          <h2 style={styles.formTitle}>Add Timetable Slot</h2>
          <form onSubmit={handleAdd}>
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
            <label style={styles.label}>Day</label>
            <select
              style={styles.input}
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <label style={styles.label}>Time</label>
            <select
              style={styles.input}
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
            >
              {TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <label style={styles.label}>Subject</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <label style={styles.label}>Teacher Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Mr. Smith"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              required
            />
            <button style={styles.submitBtn} type="submit">
              Add Slot
            </button>
          </form>
        </div>
      )}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Time</th>
              {DAYS.map((d) => (
                <th key={d} style={styles.th}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMES.map((time) => (
              <tr key={time}>
                <td style={styles.timeCell}>{time}</td>
                {DAYS.map((d) => {
                  const slot = getSlot(d, time);
                  return (
                    <td key={d} style={styles.td}>
                      {slot ? (
                        <div style={styles.slot}>
                          <p style={styles.slotSubject}>{slot.subject}</p>
                          <p style={styles.slotTeacher}>{slot.teacher_name}</p>
                          {profile && profile.role === "tutor" && (
                            <button
                              onClick={() => handleDelete(slot.id)}
                              style={styles.deleteBtn}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ) : (
                        <div style={styles.emptySlot}>—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
  headerRight: { display: "flex", gap: "12px", alignItems: "center" },
  gradeSelect: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
  },
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
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  tableWrapper: {
    overflowX: "auto",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    background: "#667eea",
    color: "white",
    padding: "14px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "600",
  },
  timeCell: {
    padding: "12px",
    textAlign: "center",
    fontWeight: "600",
    color: "#667eea",
    background: "#f8f9ff",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "8px",
    textAlign: "center",
    borderBottom: "1px solid #f0f0f0",
    minWidth: "120px",
  },
  slot: {
    background: "#f0f0ff",
    borderRadius: "8px",
    padding: "8px",
    position: "relative",
  },
  slotSubject: { fontWeight: "600", color: "#333", fontSize: "13px" },
  slotTeacher: { color: "#667eea", fontSize: "11px", marginTop: "2px" },
  deleteBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    background: "none",
    border: "none",
    color: "#e53e3e",
    cursor: "pointer",
    fontSize: "11px",
  },
  emptySlot: { color: "#ddd", fontSize: "18px" },
};
