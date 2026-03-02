import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Video, Settings, Users, ArrowRight } from "lucide-react";


export default function VideoMeeting() {
    const [roomName, setRoomName] = useState("");
    const [inMeeting, setInMeeting] = useState(false);

    const handleJoin = (e) => {
        e.preventDefault();
        if (roomName.trim()) {
            setInMeeting(true);
        }
    };

    if (inMeeting) {
        return (
            <div className="h-screen w-full flex flex-col bg-gray-900">
                <header className="h-14 bg-gray-950 text-white flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 border-b border-gray-800">
                    <div className="flex items-center text-gray-400 text-sm font-medium">
                        <Video className="w-5 h-5 mr-3 text-indigo-400" />
                        <span className="hidden sm:inline">Virtual Classroom:</span>
                        <span className="text-white ml-2 uppercase truncate max-w-[150px] sm:max-w-none">{roomName}</span>
                    </div>
                    <button
                        onClick={() => setInMeeting(false)}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded text-sm transition-colors"
                    >
                        Leave Class
                    </button>
                </header>
                <div className="flex-1 w-full relative">
                    {/* Jitsi Iframe wrapped to completely cover the flex-1 area */}
                    <iframe
                        src={`https://meet.jit.si/${encodeURIComponent(roomName)}`}
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        className="absolute inset-0 w-full h-full border-none"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center">
                        <Link to="/dashboard/student" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            <span className="font-medium">Back to Dashboard</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-indigo-600 p-8 text-center">
                            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                                <Video className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Virtual Classroom</h2>
                            <p className="text-indigo-100 mt-2">Join your live academic sessions.</p>
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleJoin} className="space-y-6">
                                <div>
                                    <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                                        Class Code or Room Name
                                    </label>
                                    <div className="mt-2 relative rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            name="roomName"
                                            id="roomName"
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-lg border-gray-300 rounded-lg py-3 bg-gray-50"
                                            placeholder="e.g. math-101-fall"
                                            value={roomName}
                                            onChange={(e) => setRoomName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Provide the room ID given by your tutor via the course announcements.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Join Session
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <Users className="mx-auto h-6 w-6 text-gray-400" />
                                    <p className="mt-1 text-xs text-gray-500">Up to 100 participants per locked room</p>
                                </div>
                                <div className="text-center">
                                    <Settings className="mx-auto h-6 w-6 text-gray-400" />
                                    <p className="mt-1 text-xs text-gray-500">End-to-End Encryption Available</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
