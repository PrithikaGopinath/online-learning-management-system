import { Link } from "react-router-dom";
import { useState } from "react";

export default function Modules() {
  // Temporary mock data since backend/Supabase tables aren't set up yet
  const [modules, setModules] = useState([
    {
      id: 1,
      title: "Computer Science Fundamentals",
      description:
        "An introduction to algorithms, data structures, and computer architecture.",
      tutor: "Dr. Alan Turing",
      progress: 45,
    },
    {
      id: 2,
      title: "Web Development",
      description:
        "Learn modern web development using React, Node.js, and Firebase.",
      tutor: "Prof. Tim Berners-Lee",
      progress: 80,
    },
    {
      id: 3,
      title: "Database Systems",
      description:
        "A deep dive into relational databases, SQL, and NoSQL systems like MongoDB.",
      tutor: "Dr. Edgar Codd",
      progress: 20,
    },
  ]);

  return (
    <div className="dashboard-container">
      {/* Reusing sidebar from dashboard logic (simplified for the page) */}
      <aside className="sidebar">
        <div className="sidebar-title">LearnHub VLE</div>
        <nav className="menu">
          <Link to="/dashboard/student">Dashboard</Link>
          <Link to="/modules" className="active">
            Modules
          </Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/chat">Messages</Link>
          <Link to="/grades">Grades</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <h2>Learning Modules</h2>
          <p>Browse and access your course materials below.</p>
        </header>

        <div className="modules-list">
          {modules.map((mod) => (
            <div key={mod.id} className="module-card">
              <div className="module-info">
                <h3>{mod.title}</h3>
                <p className="tutor-name">Tutor: {mod.tutor}</p>
                <p className="description">{mod.description}</p>
              </div>
              <div className="module-actions">
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${mod.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{mod.progress}% Complete</span>
                <button className="btn-view">View Materials</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
