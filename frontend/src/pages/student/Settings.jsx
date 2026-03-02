import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Bell, Lock, Globe, Upload } from "lucide-react";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("profile");

    // Mock user settings
    const [profile, setProfile] = useState({
        name: "Student User",
        email: "student@example.com",
        bio: "Computer Science Major. Passionate about web development.",
        timezone: "London (GMT+0)",
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <Link to="/dashboard/student" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <div className="font-semibold text-gray-900">Account Settings</div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

                <div className="text-center sm:text-left mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                    <p className="mt-2 text-gray-500">Manage your account preferences and profile details.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* Settings Navigation Sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <User className={`h-5 w-5 mr-3 ${activeTab === 'profile' ? 'text-indigo-700' : 'text-gray-400'}`} />
                                Public Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <Bell className={`h-5 w-5 mr-3 ${activeTab === 'notifications' ? 'text-indigo-700' : 'text-gray-400'}`} />
                                Notifications
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <Lock className={`h-5 w-5 mr-3 ${activeTab === 'security' ? 'text-indigo-700' : 'text-gray-400'}`} />
                                Security
                            </button>
                            <button
                                onClick={() => setActiveTab('preferences')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'preferences' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <Globe className={`h-5 w-5 mr-3 ${activeTab === 'preferences' ? 'text-indigo-700' : 'text-gray-400'}`} />
                                Regional
                            </button>
                        </nav>
                    </aside>

                    {/* Settings Content Area */}
                    <div className="flex-1">
                        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">

                            {/* Profile Settings Tab */}
                            {activeTab === 'profile' && (
                                <div className="p-6 sm:p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

                                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                                        <div className="h-24 w-24 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-3xl font-bold shrink-0">
                                            {profile.name.charAt(0)}
                                        </div>
                                        <div>
                                            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                <Upload className="h-4 w-4 mr-2" /> Change Avatar
                                            </button>
                                            <p className="mt-2 text-xs text-gray-500">JPG, GIF or PNG. 1MB max.</p>
                                        </div>
                                    </div>

                                    <form className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <input type="text" value={profile.name} onChange={r => setProfile({ ...profile, name: r.target.value })} className="block w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                                <input type="email" value={profile.email} disabled className="block w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-4 py-2.5 sm:text-sm" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                            <textarea rows="4" value={profile.bio} onChange={r => setProfile({ ...profile, bio: r.target.value })} className="block w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"></textarea>
                                            <p className="mt-1 text-xs text-gray-500">Brief description for your profile. URLs are hyperlinked.</p>
                                        </div>

                                        <div className="pt-5 border-t border-gray-100 flex justify-end">
                                            <button type="button" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Placeholders for other tabs */}
                            {activeTab !== 'profile' && (
                                <div className="p-8 text-center text-gray-500 h-64 flex items-center justify-center flex-col">
                                    <AlertCircle className="h-10 w-10 text-gray-300 mb-3" />
                                    <p>This settings tab is currently under construction.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Temporary Lucide icon since it wasn't imported at top
const AlertCircle = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
