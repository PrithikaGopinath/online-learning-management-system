import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PlusCircle, BookOpen, Users, Video } from "lucide-react";
import CourseCard from "../../components/ui/CourseCard";
import { useState } from "react";

export default function TutorDashboard() {
  const { user } = useAuth();

  const [courses] = useState([
    {
      id: "1",
      title: "Algebra II (Period 1)",
      description: "Advanced algebra concepts for 10th-grade students.",
      thumbnail_url:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      category: "Mathematics",
      grade_level: "10",
      student_count: 28,
      completion_rate: 65,
    },
    {
      id: "2",
      title: "Geometry & Trig (Period 4)",
      description: "Core geometry and trigonometry foundations.",
      thumbnail_url:
        "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
      category: "Mathematics",
      grade_level: "10",
      student_count: 24,
      completion_rate: 42,
    },
    {
      id: "3",
      title: "AP Calculus AB (Period 6)",
      description: "Advanced placement calculus preparation.",
      thumbnail_url:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      category: "Mathematics",
      grade_level: "11/12",
      student_count: 15,
      completion_rate: 88,
    },
  ]);

  return (
    <div className="flex h-screen bg-gray-50 max-w-7xl mx-auto">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">LearnHub</span>
        </div>

        <div className="px-4 py-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Tutor Portal
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {/* FIXED ROUTE */}
          <Link
            to="/tutor"
            className="flex items-center px-3 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium"
          >
            <BookOpen className="h-5 w-5 mr-3" />
            My Courses
          </Link>

          <Link
            to="#"
            className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
          >
            <Users className="h-5 w-5 mr-3 text-gray-400" />
            Students
          </Link>

          <Link
            to="/messages"
            className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
          >
            <svg
              className="h-5 w-5 mr-3 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Messages
          </Link>

          <Link
            to="/meeting"
            className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
          >
            <Video className="h-5 w-5 mr-3 text-gray-400" />
            Video Sessions
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">
            Tutor Dashboard
          </h1>

          <div className="flex items-center space-x-4">
            {/* FIXED ROUTE */}
            <Link
              to="/tutor/settings"
              className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold hover:bg-indigo-200 cursor-pointer"
            >
              T
            </Link>
          </div>
        </header>

        <div className="p-8">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
              <p className="mt-1 text-gray-500">
                Manage and create new learning materials.
              </p>
            </div>

            <Link
              to="/tutor/courses/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Course
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
              <div className="px-6 py-5">
                <div className="text-sm font-medium text-gray-500 truncate">
                  Total Students
                </div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  142
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
              <div className="px-6 py-5">
                <div className="text-sm font-medium text-gray-500 truncate">
                  Active Courses
                </div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  1
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
              <div className="px-6 py-5">
                <div className="text-sm font-medium text-gray-500 truncate">
                  Total Revenue
                </div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  $0.00
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} role="tutor" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
