import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Send, MoreVertical, Phone, Video } from "lucide-react";

export default function MessagesLayout() {
    const [activeChat, setActiveChat] = useState(1);
    const [newMessage, setNewMessage] = useState("");

    const contacts = [
        { id: 1, name: "Dr. Alan Turing", role: "Tutor", lastMessage: "Yes, the midterm covers chapters 1-4.", time: "10:30 AM", unread: 0, initial: "AT", color: "bg-indigo-100 text-indigo-700" },
        { id: 2, name: "Sarah Jenkins", role: "Tutor", lastMessage: "Your essay draft is looking good.", time: "Yesterday", unread: 1, initial: "SJ", color: "bg-purple-100 text-purple-700" },
        { id: 3, name: "John Doe", role: "Student", lastMessage: "Are we still meeting for the study group?", time: "2 days ago", unread: 0, initial: "JD", color: "bg-gray-100 text-gray-700" },
    ];

    const messages = [
        { id: 1, sender: "me", text: "Hi Professor, I have a quick question about the upcoming midterm." },
        { id: 2, sender: "them", text: "Hello! What's your question?" },
        { id: 3, sender: "me", text: "Does it cover chapter 5 on advanced patterns, or just up to chapter 4?" },
        { id: 4, sender: "them", text: "Yes, the midterm covers chapters 1-4. Chapter 5 will be on the final." },
    ];

    const handleSend = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            // Send logic
            setNewMessage('');
        }
    };

    const activeUser = contacts.find(c => c.id === activeChat);

    return (
        <div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden border-t border-gray-200">

            {/* Sidebar Inbox List */}
            <aside className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col shrink-0 h-[40vh] md:h-full">
                <div className="p-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center mb-4">
                        <Link to="/dashboard/student" className="mr-3 text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {contacts.map(contact => (
                        <button
                            key={contact.id}
                            onClick={() => setActiveChat(contact.id)}
                            className={`w-full flex items-start p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${activeChat === contact.id ? "bg-indigo-50/50" : ""}`}
                        >
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg mr-3 shrink-0 ${contact.color}`}>
                                {contact.initial}
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                                <div className="flex items-baseline justify-between mb-1">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h3>
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{contact.time}</span>
                                </div>
                                <p className="text-xs text-indigo-600 font-medium mb-1">{contact.role}</p>
                                <p className={`text-sm truncate ${contact.unread ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                                    {contact.lastMessage}
                                </p>
                            </div>
                            {contact.unread > 0 && (
                                <div className="h-5 w-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-2">
                                    {contact.unread}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Active Chat Window */}
            <main className="flex-1 flex flex-col h-[60vh] md:h-full bg-gray-50">

                {/* Chat Header */}
                <header className="h-16 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm z-10">
                    <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold mr-3 shrink-0 ${activeUser.color}`}>
                            {activeUser.initial}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 leading-none">{activeUser.name}</h2>
                            <p className="text-xs text-gray-500 mt-1">{activeUser.role}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-3 text-gray-400">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"><Phone className="h-5 w-5" /></button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"><Video className="h-5 w-5" /></button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical className="h-5 w-5" /></button>
                    </div>
                </header>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    <div className="text-center mb-8">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-200 px-3 py-1 rounded-full">Today</span>
                    </div>

                    {messages.map(msg => {
                        const isMe = msg.sender === "me";
                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                {!isMe && (
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs mr-2 shrink-0 self-end mb-1 ${activeUser.color}`}>
                                        {activeUser.initial}
                                    </div>
                                )}
                                <div className={`max-w-[75%] lg:max-w-[60%] rounded-2xl px-5 py-3 shadow-sm ${isMe
                                        ? "bg-indigo-600 text-white rounded-br-sm"
                                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Message Input Box */}
                <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                    <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
                        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm max-h-32 min-h-[44px]"
                                rows="1"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shrink-0"
                        >
                            <Send className="h-5 w-5 ml-0.5" />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
