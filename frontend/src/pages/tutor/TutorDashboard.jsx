import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  PlusCircle,
  BookOpen,
  Users,
  Video,
  MessageSquare,
  FileText,
  CheckCircle,
} from "lucide-react";
import CourseCard from "../../components/ui/CourseCard";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

export default function TutorDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (user) {
      loadTutorProfile();
      loadCourses();
      loadAssignedStudents();
      loadRecentMessages();
      loadRecentSubmissions();
    }
  }, [user]);

  async function loadTutorProfile() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
  }

  async function loadCourses() {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("tutor_id", user.id);

    setCourses(data || []);
  }

  async function loadAssignedStudents() {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, grade")
      .eq("assigned_tutor_id", user.id);

    setStudents(data || []);
  }

  async function loadRecentMessages() {
    const { data } = await supabase
      .from("messages")
      .select("content, sender_id, created_at")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentMessages(data || []);
  }

  async function loadRecentSubmissions() {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(5);

    setSubmissions(data || []);
  }

  async function createFakeSubmission() {
    const { data: userData } = await supabase.auth.getUser();

    const fake = {
      title: "Test Coursework",
      description: "This is a fake submission for testing.",
      file_url: "https://example.com/fake-file.pdf",
      student_id: userData?.user?.id || "test-student-123",
      submitted_at: new Date().toISOString(),
      grade: null,
      feedback: null,
    };

    const { error } = await supabase.from("submissions").insert(fake);

    if (!error) {
      alert("Fake submission created!");
      loadRecentSubmissions(); // refresh dashboard
    }
  }

  <button
    onClick={createFakeSubmission}
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
  >
    + Create Fake Submission
  </button>;

  return (
    <div className="flex h-screen bg-gray-50 max-w-7xl mx-auto">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">LearnHub</span>
        </div>

        <div className="px-4 py-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Tutor Portal
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <Link
            to="/tutor"
            className="flex items-center px-3 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium"
          >
            <BookOpen className="h-5 w-5 mr-3" />
            My Courses
          </Link>

          <Link
            to="/review-submissions"
            className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
          >
            <FileText className="h-5 w-5 mr-3 text-gray-400" />
            Review Submissions
          </Link>

          <Link
            to="/tutor/students"
            className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
          >
            <Users className="h-5 w-5 mr-3 text-gray-400" />
            Students
          </Link>

          <Link
            to="/messages"
            className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
          >
            <MessageSquare className="h-5 w-5 mr-3 text-gray-400" />
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">
            Tutor Dashboard
          </h1>

          <Link
            to="/tutor/settings"
            className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold hover:bg-indigo-200 cursor-pointer"
          >
            {profile?.full_name?.charAt(0) || "T"}
          </Link>
        </header>

        <div className="p-8 space-y-10">
          {/* Header + Create Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
              <p className="mt-1 text-gray-500">
                Manage and create new learning materials.
              </p>
            </div>

            <Link
              to="/tutor/courses/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Course
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="bg-white shadow-sm rounded-xl border p-6">
              <div className="text-sm font-medium text-gray-500">
                Total Students
              </div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {students.length}
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border p-6">
              <div className="text-sm font-medium text-gray-500">
                Active Courses
              </div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {courses.length}
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border p-6">
              <div className="text-sm font-medium text-gray-500">
                Recent Messages
              </div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {recentMessages.length}
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border p-6">
              <div className="text-sm font-medium text-gray-500">
                Coursework Submissions
              </div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">
                {submissions.length}
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Courses (2 columns wide) */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} role="tutor" />
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-8">
              {/* Students */}
              <div className="bg-white p-5 rounded-xl shadow border">
                <h3 className="text-lg font-semibold mb-3">Your Students</h3>
                {students.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No students assigned yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {students.map((s) => (
                      <div key={s.id} className="border-b pb-2">
                        <p className="font-medium">{s.full_name}</p>
                        <p className="text-sm text-gray-500">
                          Grade: {s.grade}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Coursework Submissions */}
              <div className="bg-white p-5 rounded-xl shadow border">
                <h3 className="text-lg font-semibold mb-3">
                  Recent Coursework Submissions
                </h3>

                {submissions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No submissions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="border-b pb-2">
                        <p className="font-medium">{sub.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(sub.submitted_at).toLocaleString()}
                        </p>

                        <Link
                          to={`/grade/${sub.id}`}
                          className="text-indigo-600 text-sm underline"
                        >
                          {sub.grade ? "Edit Grade" : "Grade"}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Messages */}
              <div className="bg-white p-5 rounded-xl shadow border">
                <h3 className="text-lg font-semibold mb-3">Recent Messages</h3>
                {recentMessages.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent messages.</p>
                ) : (
                  <div className="space-y-3">
                    {recentMessages.map((msg, i) => (
                      <div key={i} className="border-b pb-2">
                        <p className="text-gray-700">{msg.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
