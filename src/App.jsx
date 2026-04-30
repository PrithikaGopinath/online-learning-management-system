import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './config/supabase'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Modules from './pages/Modules.jsx'
import Assignments from './pages/Assignments.jsx'
import Timetable from './pages/Timetable.jsx'
import VideoMeeting from './pages/VideoMeeting.jsx'
import Chat from './pages/Chat.jsx'
import Announcements from './pages/Announcements.jsx'
import Quiz from './pages/Quiz.jsx'
import Sidebar from './components/sidebar.jsx'
import Students from './pages/Students.jsx'
import Progress from './pages/Progress.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
        <p style={{ color: '#5c6bc0', fontSize: '18px', fontWeight: '600' }}>Loading LearnHub VLE...</p>
      </div>
    </div>
  )

  return (
    <Router>
      {user ? (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <div style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', background: '#f0f2f5' }}>
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
  )
}

export default App