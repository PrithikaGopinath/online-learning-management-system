import { useState } from "react";
import { ChevronDown, ChevronUp, PlayCircle, FileText, CheckCircle } from "lucide-react";

export default function ModuleList({ modules, activeLessonId, onSelectLesson }) {
    const [openModules, setOpenModules] = useState([modules[0]?.id]);

    const toggleModule = (id) => {
        if (openModules.includes(id)) {
            setOpenModules(openModules.filter(mId => mId !== id));
        } else {
            setOpenModules([...openModules, id]);
        }
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Course Content</h3>
            </div>

            <div className="divide-y divide-gray-100">
                {modules.map((module, mIndex) => {
                    const isOpen = openModules.includes(module.id);

                    return (
                        <div key={module.id} className="module-group">
                            {/* Module Header */}
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
                            >
                                <div>
                                    <div className="text-xs font-semibold tracking-wider text-indigo-600 mb-1">
                                        MODULE {mIndex + 1}
                                    </div>
                                    <div className="font-medium text-gray-900">{module.title}</div>
                                </div>
                                {isOpen ? (
                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                            </button>

                            {/* Lessons List */}
                            {isOpen && (
                                <div className="bg-gray-50/50 border-t border-gray-100 flex flex-col">
                                    {module.lessons?.map((lesson, lIndex) => {
                                        const isActive = lesson.id === activeLessonId;

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => onSelectLesson(lesson)}
                                                className={`
                          flex items-start p-3 pl-8 text-left transition-colors border-l-2
                          ${isActive
                                                        ? "bg-indigo-50 border-indigo-600"
                                                        : "hover:bg-gray-100 border-transparent"
                                                    }
                        `}
                                            >
                                                <div className="mt-0.5 mr-3 flex-shrink-0">
                                                    {lesson.is_completed ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : lesson.type === 'video' ? (
                                                        <PlayCircle className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                                                    ) : (
                                                        <FileText className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${isActive ? "text-indigo-900" : "text-gray-700"}`}>
                                                        {mIndex + 1}.{lIndex + 1} {lesson.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {lesson.duration || "5 min"}
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
