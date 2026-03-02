
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ManageGrades() {
    const [students, setStudents] = useState([
        { id: 1, name: "Alice Smith", module: "Web Development", assignment: "Project 1", score: 92, total: 100 },
        { id: 2, name: "Bob Johnson", module: "Web Development", assignment: "Project 1", score: 78, total: 100 },
        { id: 3, name: "Charlie Davis", module: "Database Systems", assignment: "Quiz 1", score: 18, total: 20 },
    ]);

    const [newGrade, setNewGrade] = useState({ student: "", assignment: "", score: "", total: "" });

    const handleAddGrade = (e) => {
        e.preventDefault();
        if (!newGrade.student || !newGrade.score) return;

        setStudents([...students, {
            id: Date.now(),
            name: newGrade.student,
            module: "Selected Module", // Placeholder
            assignment: newGrade.assignment,
            score: parseInt(newGrade.score),
            total: parseInt(newGrade.total) || 100
        }]);

        setNewGrade({ student: "", assignment: "", score: "", total: "" });
        alert("Grade posted successfully!");
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-title">LearnHub VLE</div>
                <nav className="menu">
                    <Link to="/dashboard/tutor">Dashboard</Link>
                    <Link to="/modules">My Modules</Link>
                    <Link to="/calendar">Calendar</Link>
                    <Link to="/chat">Messages</Link>
                    <Link to="/manage-grades" className="active">Manage Grades</Link>
                    <Link to="/settings">Settings</Link>
                </nav>
            </aside>

            <main className="main">
                <header className="topbar">
                    <h2>Manage Grades</h2>
                    <p>Enter and update student grades here.</p>
                </header>

                <div className="grades-card" style={{ marginBottom: "2rem" }}>
                    <h3>Post New Grade</h3>
                    <form className="manage-grades-controls" onSubmit={handleAddGrade}>
                        <input
                            type="text"
                            placeholder="Student Name"
                            value={newGrade.student}
                            onChange={e => setNewGrade({ ...newGrade, student: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Assignment Name"
                            value={newGrade.assignment}
                            onChange={e => setNewGrade({ ...newGrade, assignment: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Score"
                            value={newGrade.score}
                            onChange={e => setNewGrade({ ...newGrade, score: e.target.value })}
                            style={{ width: "80px" }}
                            required
                        />
                        <span> / </span>
                        <input
                            type="number"
                            placeholder="Total"
                            value={newGrade.total}
                            onChange={e => setNewGrade({ ...newGrade, total: e.target.value })}
                            style={{ width: "80px" }}
                        />
                        <button type="submit" className="btn-action">Post Grade</button>
                    </form>
                </div>

                <div className="grades-card">
                    <h3>Recent Grades</h3>
                    <table className="grades-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Module</th>
                                <th>Assignment</th>
                                <th>Score</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.name}</td>
                                    <td>{student.module}</td>
                                    <td>{student.assignment}</td>
                                    <td>{student.score} / {student.total}</td>
                                    <td><button className="btn-action" style={{ background: "#555" }}>Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
