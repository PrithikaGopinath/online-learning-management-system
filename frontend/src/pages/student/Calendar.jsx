import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  UploadCloud,
  AlertCircle,
} from "lucide-react";

export default function StudentCalendar() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const schedule = [
    {
      id: 1,
      title: "MATH 101: Linear Algebra",
      type: "class",
      day: "Monday",
      time: "09:00 - 10:30",
      location: "Room 4B",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      id: 2,
      title: "CS 210: Data Structures Assignment 1",
      type: "submission",
      day: "Monday",
      time: "23:59",
      location: "Online Portal",
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    {
      id: 3,
      title: "PHYS 201: Mechanics Lab",
      type: "class",
      day: "Tuesday",
      time: "11:00 - 14:00",
      location: "Lab System B",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      id: 4,
      title: "CS 210: Algorithms Midterm",
      type: "exam",
      day: "Wednesday",
      time: "10:00 - 12:00",
      location: "Main Examination Hall",
      color: "bg-red-100 text-red-800 border-red-200",
    },
    {
      id: 5,
      title: "ENG 105: Essay Draft Due",
      type: "submission",
      day: "Thursday",
      time: "17:00",
      location: "Turnitin",
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    {
      id: 6,
      title: "Group Meeting: Final Project",
      type: "meeting",
      day: "Friday",
      time: "15:00 - 16:00",
      location: "Library Pod 3",
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* FIXED ROUTE */}
            <Link
              to="/student"
              className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>

            <div className="font-bold text-xl text-indigo-600 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Academic Timetable
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Week of March 2nd
            </h1>
            <p className="text-gray-500 mt-2">
              Manage your classes, exams, and assignment deadlines.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-4 text-sm font-medium">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>{" "}
              Classes
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Exams
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>{" "}
              Deadlines
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {days.map((day) => {
            const dayEvents = schedule
              .filter((e) => e.day === day)
              .sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div
                key={day}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px]"
              >
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 text-center font-bold text-gray-700 uppercase tracking-wide text-sm">
                  {day}
                </div>

                <div className="flex-1 p-3 flex flex-col gap-3 bg-gray-50/50">
                  {dayEvents.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                      No events scheduled
                    </div>
                  ) : (
                    dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-lg border shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md ${event.color}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-sm leading-tight pr-4">
                            {event.title}
                          </h3>
                          {event.type === "exam" && (
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                          )}
                          {event.type === "submission" && (
                            <UploadCloud className="h-4 w-4 shrink-0 text-orange-600" />
                          )}
                        </div>

                        <div className="flex items-center text-xs opacity-90 mb-1 mt-auto pt-2">
                          <Clock className="h-3 w-3 mr-1.5 shrink-0" />
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <div className="flex items-center text-xs opacity-80">
                          <MapPin className="h-3 w-3 mr-1.5 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
