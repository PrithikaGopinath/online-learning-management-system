import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./config/supabase";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Modules from "./pages/Modules.jsx";
import Assignments from "./pages/Assignments.jsx";
import Timetable from "./pages/Timetable.jsx";
import VideoMeeting from "./pages/VideoMeeting.jsx";
import Chat from "./pages/Chat.jsx";
import Announcements from "./pages/Announcements.jsx";
import Quiz from "./pages/Quiz.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Students from "./pages/Students.jsx";
import Progress from "./pages/Progress.jsx";
import Grades from "./pages/Grades.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎓</div>
          <p style={{ color: "#5c6bc0", fontSize: "18px", fontWeight: "600" }}>
            Loading LearnHub VLE...
          </p>
        </div>
      </div>
    );

  return (
    <Router>
      {user ? (
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <div
            style={{
              flex: 1,
              marginLeft: "260px",
              minHeight: "100vh",
              background: "#f0f2f5",
            }}
          >
            {/* Mobile Header — only shows on phone */}
            <div
              style={{
                display: "none",
                padding: "12px 16px",
                background: "white",
                borderBottom: "1px solid #e0e0e0",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                zIndex: 99,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              className="mobile-header"
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "20px" }}>📖</span>
                <span
                  style={{
                    fontWeight: "700",
                    color: "#1a1a2e",
                    fontSize: "16px",
                  }}
                >
                  LearnHub VLE
                </span>
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  background: "#ffebee",
                  color: "#e53935",
                  border: "1px solid #ffcdd2",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                🚪 Sign Out
              </button>
            </div>

            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/meeting" element={<VideoMeeting />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/students" element={<Students />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/grades" element={<Grades />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
