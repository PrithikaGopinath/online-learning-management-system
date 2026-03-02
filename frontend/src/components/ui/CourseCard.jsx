export default function CourseCard({ course, onClick, role = "student" }) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
        >
            <div className="h-48 bg-gray-200 relative">
                {course.thumbnail_url ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                        <span className="text-4xl">📚</span>
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-sm">
                    {course.category}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                {role === "student" && course.tutor_name && (
                    <p className="text-sm text-gray-500 mb-3">by {course.tutor_name}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                    {course.category && (
                        <span className="inline-block px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
                            {course.category}
                        </span>
                    )}
                    {course.grade_level && (
                        <span className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                            Grade {course.grade_level}
                        </span>
                    )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                    {course.description}
                </p>

                {role === "student" && course.progress !== undefined && (
                    <div className="mt-auto">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                            <span>Progress</span>
                            <span className="font-medium text-indigo-600">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {role === "tutor" && (
                    <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between text-sm text-gray-500">
                        <span>{course.students_count || 0} Students</span>
                        <span className={course.is_published ? "text-green-600" : "text-amber-500"}>
                            {course.is_published ? "Published" : "Draft"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
