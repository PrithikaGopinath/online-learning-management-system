import { Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login.jsx";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import Calendar from "./pages/student/Calendar.jsx";
import Grades from "./pages/student/Grades.jsx";
import LessonViewer from "./pages/student/LessonViewer.jsx";
import StudentSettings from "./pages/student/Settings.jsx";
import SubmitCoursework from "./pages/student/SubmitCoursework.jsx";
import MySubmissions from "./pages/student/MySubmissions.jsx";

// Tutor pages
import TutorDashboard from "./pages/tutor/TutorDashboard.jsx";
import ManageGrades from "./pages/tutor/ManageGrades.jsx";
import CreateCourse from "./pages/tutor/CreateCourse.jsx";
import ReviewSubmissions from "./pages/tutor/ReviewSubmissions.jsx";
import GradeSubmission from "./pages/tutor/GradeSubmission.jsx";

// Chat pages
import MessagesLayout from "./pages/chat/MessagesLayout.jsx";

// Course pages
import Modules from "./pages/course/Modules.jsx";
import VideoMeeting from "./pages/course/VideoMeeting.jsx";

// Auth protection
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendar"
        element={
          <ProtectedRoute allowedRole="student">
            <Calendar />
          </ProtectedRoute>
        }
      />

      <Route
        path="/grades"
        element={
          <ProtectedRoute allowedRole="student">
            <Grades />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses/:id/learn"
        element={
          <ProtectedRoute allowedRole="student">
            <LessonViewer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/settings"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submit-coursework"
        element={
          <ProtectedRoute allowedRole="student">
            <SubmitCoursework />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-submissions"
        element={
          <ProtectedRoute allowedRole="student">
            <MySubmissions />
          </ProtectedRoute>
        }
      />

      {/* Tutor */}
      <Route
        path="/tutor"
        element={
          <ProtectedRoute allowedRole="tutor">
            <TutorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage-grades"
        element={
          <ProtectedRoute allowedRole="tutor">
            <ManageGrades />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tutor/courses/new"
        element={
          <ProtectedRoute allowedRole="tutor">
            <CreateCourse />
          </ProtectedRoute>
        }
      />

      <Route
        path="/review-submissions"
        element={
          <ProtectedRoute allowedRole="tutor">
            <ReviewSubmissions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/grade/:id"
        element={
          <ProtectedRoute allowedRole="tutor">
            <GradeSubmission />
          </ProtectedRoute>
        }
      />

      {/* Chat */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute allowedRole={["student", "tutor"]}>
            <MessagesLayout />
          </ProtectedRoute>
        }
      />

      {/* Courses */}
      <Route
        path="/modules"
        element={
          <ProtectedRoute allowedRole="student">
            <Modules />
          </ProtectedRoute>
        }
      />

      <Route path="/meeting" element={<VideoMeeting />} />
    </Routes>
  );
}
