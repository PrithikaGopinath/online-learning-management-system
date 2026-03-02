import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, FileImageIcon } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

export default function CreateCourse() {
    const [course, setCourse] = useState({
        title: "",
        description: "",
        category: "Programming"
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. In a real app, upload the thumbnail to Supabase Storage here
            // const fileExt = thumbnailFile.name.split('.').pop();
            // const fileName = `${Math.random()}.${fileExt}`;
            // const { data, error } = await supabase.storage.from('course-media').upload(fileName, thumbnailFile);
            // const thumbnailUrl = data.path; // + format public url

            // 2. Insert into Courses Table
            /*
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('courses').insert([
              { 
                tutor_id: user.id,
                title: course.title,
                description: course.description,
                category: course.category,
                thumbnail_url: "placeholder_url", // Use actual uploaded url
                is_published: false
              }
            ]);
            */

            alert("Course created successfully! Navigating to builder...");
            // navigate(`/tutor/courses/${newCourseId}/build`);
        } catch (error) {
            console.error("Error creating course:", error);
            alert("Failed to create course");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center">
                        <Link to="/dashboard/tutor" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-6 border-b border-gray-100 bg-gray-50">
                        <h1 className="text-2xl font-bold text-gray-900">Create a New Course</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Start by defining the basic information about your new course. You can add modules and video lessons later.
                        </p>
                    </div>

                    <form onSubmit={handleCreate} className="p-6 space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={course.title}
                                onChange={e => setCourse({ ...course, title: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="e.g. Advanced React Patterns"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                value={course.category}
                                onChange={e => setCourse({ ...course, category: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="Programming">Programming</option>
                                <option value="Design">Design</option>
                                <option value="Business">Business</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Description</label>
                            <textarea
                                rows="4"
                                value={course.description}
                                onChange={e => setCourse({ ...course, description: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="What will your students learn?"
                            ></textarea>
                        </div>

                        {/* Thumbnail Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                                <div className="space-y-1 text-center">
                                    <FileImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-2 py-0.5 shadow-sm border border-gray-200">
                                            <span>Upload a file</span>
                                            <input
                                                type="file"
                                                className="sr-only"
                                                accept="image/*"
                                                onChange={e => setThumbnailFile(e.target.files[0])}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {thumbnailFile ? thumbnailFile.name : "PNG, JPG, GIF up to 5MB"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-5 border-t border-gray-200 flex justify-end">
                            <Link
                                to="/dashboard/tutor"
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 flex items-center"
                            >
                                {loading && <Upload className="animate-bounce h-4 w-4 mr-2" />}
                                Create Course
                            </button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
}
