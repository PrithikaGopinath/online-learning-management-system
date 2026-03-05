import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Video, BookMarked, Award } from "lucide-react";
import CourseCard from "../../components/ui/CourseCard";

export default function StudentDashboard() {
  const { user } = useAuth();

  // Mock data for enrolled courses (VLE Style)
  const enrolledCourses = [
    {
      id: "1",
      title: "Mathematics (Homeroom)",
      description:
        "Core math curriculum for Grade 4. Covers fractions, long division, and geometry.",
      thumbnail_url:
        "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80",
      category: "Math",
      grade_level: "4",
      tutor_name: "Mrs. Davis",
      progress: 75,
    },
    {
      id: "2",
      title: "Science Explorer (Homeroom)",
      description:
        "Introduction to earth science, ecosystems, and basic physics.",
      thumbnail_url:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
      category: "Science",
      grade_level: "4",
      tutor_name: "Mrs. Davis",
      progress: 30,
    },
    {
      id: "3",
      title: "Language Arts",
      description: "Reading comprehension, spelling, and creative writing.",
      thumbnail_url:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
      category: "English",
      grade_level: "4",
      tutor_name: "Mrs. Davis",
      progress: 90,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 max-w-7xl mx-auto">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">LearnHub</span>
        </div>

        <div className="px-4 py-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Student Portal
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <Link
            to="/dashboard/student"
            className="flex items-center px-3 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium"
          >
            <BookMarked className="h-5 w-5 mr-3" />
            Home
          </Link>

          <Link
            to="/calendar"
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Timetable
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
            Live Meetings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">
            Student Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
              <Award className="h-4 w-4 mr-1.5" />
              1,240 XP
            </div>
            <Link
              to="/settings"
              className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold hover:bg-indigo-200 transition-colors cursor-pointer"
            >
              S
            </Link>
          </div>
        </header>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
            <p className="mt-1 text-gray-500">
              Pick up where you left off and keep learning.
            </p>
          </div>

          {/* Continue Learning Banner */}
          {enrolledCourses.length > 0 && (
            <div className="mb-10 bg-indigo-600 rounded-2xl overflow-hidden shadow-md flex flex-col sm:flex-row relative">
              <div className="p-8 sm:w-2/3 flex flex-col justify-center text-white relative z-10">
                <span className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-2">
                  Continue Learning
                </span>
                <h3 className="text-2xl font-bold mb-2">
                  {enrolledCourses[0].title}
                </h3>
                <p className="text-indigo-100 mb-6 max-w-md">
                  You're almost halfway through this course! The next lesson is
                  "React Hooks in Depth".
                </p>
                <Link
                  to={`/courses/${enrolledCourses[0].id}/learn`}
                  className="inline-flex w-max items-center justify-center px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Resume Course
                </Link>
              </div>
              <div className="hidden sm:block absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-transparent to-indigo-600 z-0 content-transparent"></div>
              <div className="hidden sm:block sm:w-1/3 absolute right-0 top-0 h-full opacity-40 mix-blend-overlay">
                <img
                  src={enrolledCourses[0].thumbnail_url}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            </div>
          )}

          {/* Enrolled Courses Grid */}
          <div className="mb-6 flex justify-between items-end">
            <h3 className="text-xl font-bold text-gray-900">
              Your Enrolled Courses
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Link
                to={`/courses/${course.id}/learn`}
                key={course.id}
                className="block group"
              >
                <CourseCard course={course} role="student" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
