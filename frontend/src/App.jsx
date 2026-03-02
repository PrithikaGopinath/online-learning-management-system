import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import StudentCalendar from "./pages/student/Calendar";
import MessagesLayout from "./pages/chat/MessagesLayout";
import Modules from "./pages/course/Modules";
import StudentGrades from "./pages/student/Grades";
import ManageGrades from "./pages/tutor/ManageGrades";
import Settings from "./pages/student/Settings";
import VideoMeeting from "./pages/course/VideoMeeting";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateCourse from "./pages/tutor/CreateCourse";
import CourseCatalog from "./pages/student/CourseCatalog";
import LessonViewer from "./pages/student/LessonViewer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard/student" element={<StudentDashboard />} />
      <Route path="/catalog" element={
        <ProtectedRoute allowedRole="student">
          <CourseCatalog />
        </ProtectedRoute>
      } />
      <Route path="/courses/:id/learn" element={
        <ProtectedRoute allowedRole="student">
          <LessonViewer />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/tutor" element={<TutorDashboard />} />
      <Route path="/tutor/courses/new" element={
        <ProtectedRoute allowedRole="tutor">
          <CreateCourse />
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={<StudentCalendar />} />
      <Route path="/messages" element={<MessagesLayout />} />
      <Route path="/modules" element={<Modules />} />
      <Route path="/grades" element={<StudentGrades />} />
      <Route path="/manage-grades" element={<ManageGrades />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/meeting" element={<VideoMeeting />} />
    </Routes>
  );
}

export default App;


