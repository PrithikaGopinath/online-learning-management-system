
import { Link } from "react-router-dom";
import { useState } from "react";

export default function StudentGrades() {
    const [grades, setGrades] = useState([
        { id: 1, module: "Computer Science Fundamentals", assignment: "Midterm Exam", score: 85, total: 100, date: "2026-02-15" },
        { id: 2, module: "Web Development", assignment: "Project 1", score: 92, total: 100, date: "2026-02-20" },
        { id: 3, module: "Database Systems", assignment: "Quiz 1", score: 18, total: 20, date: "2026-02-25" },
    ]);

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-title">LearnHub VLE</div>
                <nav className="menu">
                    <Link to="/dashboard/student">Dashboard</Link>
                    <Link to="/modules">My Courses</Link>
                    <Link to="/calendar">Calendar</Link>
                    <Link to="/chat">Messages</Link>
                    <Link to="/grades" className="active">Grades</Link>
                    <Link to="/settings">Settings</Link>
                </nav>
            </aside>

            <main className="main">
                <header className="topbar">
                    <h2>My Grades</h2>
                    <p>View your recent assignment and exam scores.</p>
                </header>

                <div className="grades-card">
                    <table className="grades-table">
                        <thead>
                            <tr>
                                <th>Module</th>
                                <th>Assignment</th>
                                <th>Date Posted</th>
                                <th>Score</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((grade) => {
                                const percentage = (grade.score / grade.total) * 100;
                                let letter = "F";
                                if (percentage >= 90) letter = "A*";
                                else if (percentage >= 80) letter = "A";
                                else if (percentage >= 70) letter = "B";
                                else if (percentage >= 60) letter = "C";

                                return (
                                    <tr key={grade.id}>
                                        <td>{grade.module}</td>
                                        <td>{grade.assignment}</td>
                                        <td>{grade.date}</td>
                                        <td>{grade.score} / {grade.total}</td>
                                        <td><span className={`grade-badge grade-${letter.charAt(0)}`}>{letter}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
