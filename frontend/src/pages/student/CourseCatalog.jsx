import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Filter } from "lucide-react";
import CourseCard from "../../components/ui/CourseCard";

export default function CourseCatalog() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    // Mock data for catalog
    const [availableCourses] = useState([
        {
            id: 1,
            title: "Advanced React Patterns",
            category: "Programming",
            thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400&auto=format&fit=crop",
            tutor_name: "Dr. Alan Turing",
            description: "Take your React skills to the next level by learning advanced design patterns."
        },
        {
            id: 2,
            title: "Supabase Masterclass",
            category: "Database",
            thumbnail_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=400&auto=format&fit=crop",
            tutor_name: "John Doe",
            description: "Learn how to build fullstack applications using Supabase as your backend."
        },
        {
            id: 3,
            title: "UI/UX Foundations",
            category: "Design",
            thumbnail_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=400&auto=format&fit=crop",
            tutor_name: "Sarah Jenkins",
            description: "A comprehensive introduction to user interface and user experience design principles."
        }
    ]);

    const categories = ["All", "Programming", "Design", "Database", "Business"];

    const filteredCourses = availableCourses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <Link to="/dashboard/student" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            <span className="font-medium">Back to Dashboard</span>
                        </Link>
                        <div className="font-bold text-xl text-indigo-600">LearnHub Catalog</div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
                        Expand your skills
                    </h1>
                    <p className="text-xl text-gray-500">
                        Choose from hundreds of online video courses with new additions published every month.
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                        <Filter className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${categoryFilter === cat
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Grid */}
                <div className="mb-4 text-sm text-gray-500 font-medium">
                    Showing {filteredCourses.length} results
                </div>

                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredCourses.map(course => (
                            <div key={course.id} className="flex flex-col h-full group">
                                <CourseCard course={course} role="catalog" />
                                <button className="mt-4 w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-semibold py-2.5 rounded-lg border border-transparent hover:shadow text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Enroll Now
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                        <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                        <p className="mt-1 text-gray-500">We couldn't find anything matching "{searchTerm}".</p>
                        <button
                            onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
                            className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
