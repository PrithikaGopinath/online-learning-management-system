import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, FileText } from "lucide-react";
import VideoPlayer from "../../components/ui/VideoPlayer";
import ModuleList from "../../components/ui/ModuleList";

export default function LessonViewer() {
    const { id } = useParams();

    // Mock data for the full course structure
    const courseData = {
        title: "Advanced React Patterns",
        tutor: "Dr. Alan Turing",
        progress: 45,
        modules: [
            {
                id: "m1",
                title: "Introduction & Context",
                lessons: [
                    { id: "l1", title: "Why Design Patterns?", type: "video", duration: "12 min", is_completed: true, url: "https://www.w3schools.com/html/mov_bbb.mp4", poster: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800" },
                    { id: "l2", title: "Course Resources", type: "pdf", duration: "Read", is_completed: true, content: "Welcome! Be sure to download the attached PDF for all course slides and source code links.", pdf_url: "#" },
                ]
            },
            {
                id: "m2",
                title: "Component Organization",
                lessons: [
                    { id: "l3", title: "Container/Presentational Pattern", type: "video", duration: "18 min", is_completed: false, url: "https://www.w3schools.com/html/mov_bbb.mp4" },
                    { id: "l4", title: "Higher Order Components", type: "video", duration: "24 min", is_completed: false, url: "https://www.w3schools.com/html/mov_bbb.mp4" },
                ]
            }
        ]
    };

    const [activeLesson, setActiveLesson] = useState(courseData.modules[0].lessons[0]);

    const handleMarkComplete = () => {
        // In a real app: update progress table in Supabase
        alert("Progress saved: Lesson marked as complete.");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navbar */}
            <header className="bg-gray-900 text-white h-16 flex items-center px-4 sm:px-6 justify-between shrink-0 sticky top-0 z-20 shadow-md">
                <div className="flex items-center min-w-0">
                    <Link to="/dashboard/student" className="flex items-center text-gray-400 hover:text-white transition-colors mr-4 group hidden sm:flex">
                        <ArrowLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm">Back</span>
                    </Link>
                    <div className="h-6 w-px bg-gray-700 mr-4 hidden sm:block"></div>
                    <h1 className="text-sm font-semibold truncate mr-4">{courseData.title}</h1>
                </div>

                <div className="flex items-center shrink-0">
                    <div className="hidden md:flex items-center mr-6 text-sm">
                        <span className="text-gray-400 mr-2">Your Progress:</span>
                        <span className="font-medium mr-3">{courseData.progress}%</span>
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${courseData.progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Learning Hub Layout */}
            <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">

                {/* Left Side: Video & Content Viewer */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                    <div className="max-w-4xl mx-auto w-full">

                        {activeLesson.type === 'video' ? (
                            <div className="mb-6">
                                <VideoPlayer url={activeLesson.url} poster={activeLesson.poster} />
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 min-h-[400px] mb-6 flex flex-col items-center justify-center text-center">
                                <FileText className="h-16 w-16 text-indigo-300 mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{activeLesson.title}</h3>
                                <p className="text-gray-600 max-w-lg mx-auto">{activeLesson.content}</p>
                                {activeLesson.pdf_url && (
                                    <button className="mt-8 px-6 py-3 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
                                        Download PDF Resource
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Lesson Details & Actions Bar */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{activeLesson.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">Instructor: {courseData.tutor}</p>
                            </div>

                            <button
                                onClick={handleMarkComplete}
                                className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors ${activeLesson.is_completed
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                                    }`}
                            >
                                <CheckCircle className={`h-5 w-5 mr-2 ${activeLesson.is_completed ? "text-green-500" : "text-indigo-200"}`} />
                                {activeLesson.is_completed ? "Completed" : "Mark as Complete"}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Right Side: Module Navigation Bar */}
                <aside className="w-full lg:w-[400px] xl:w-[450px] bg-white border-l border-gray-200 flex flex-col shrink-0 h-auto lg:h-[calc(100vh-64px)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                        <h3 className="font-bold text-gray-900 text-lg">Course Content</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <ModuleList
                            modules={courseData.modules}
                            activeLessonId={activeLesson.id}
                            onSelectLesson={setActiveLesson}
                        />
                    </div>
                </aside>

            </div>
        </div>
    );
}
