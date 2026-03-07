import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function MessagesLayout() {
  const { user, profile } = useAuth();

  // 🔥 STEP 1 LOGS ADDED HERE
  console.log("AUTH USER:", user);
  console.log("PROFILE FROM CONTEXT:", profile);

  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Load contacts based on grade + role
  useEffect(() => {
    if (!profile?.id) return;

    const loadContacts = async () => {
      let query = supabase.from("profiles").select("*");

      if (profile.role === "student") {
        if (profile.grade <= 6) {
          query = query.eq("id", profile.assigned_tutor_id);
        } else {
          query = query.eq("role", "tutor");
        }
      }

      if (profile.role === "tutor") {
        query = query.eq("assigned_tutor_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Contacts load error:", error);
        setContacts([]);
        return;
      }

      setContacts(data || []);

      if (data && data.length > 0) {
        setActiveChat(data[0].id);
      }
    };

    loadContacts();
  }, [
    profile?.id,
    profile?.role,
    profile?.grade,
    profile?.assigned_tutor_id,
    user?.id,
  ]);

  // Load all messages involving the logged‑in user
  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Messages load error:", error);
        setMessages([]);
        return;
      }

      setMessages(data || []);
    };

    loadMessages();
  }, [user]);

  // Real‑time listener
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;

          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            setMessages((prev) => [...prev, msg]);
          }
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: activeChat,
      content: newMessage,
    });

    if (error) {
      console.error("Send message error:", error);
      return;
    }

    setNewMessage("");
  };

  if (!profile) return <div className="p-6">Loading...</div>;

  const activeUser = contacts.find((c) => c.id === activeChat);

  // 🔥 STEP 1 LOGS ADDED HERE
  console.log("CONTACTS:", contacts);
  console.log("ACTIVE CHAT:", activeChat);

  return (
    <div className="h-screen bg-white flex flex-col md:flex-row overflow-hidden border-t border-gray-200">
      {/* Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col shrink-0 h-[40vh] md:h-full">
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center mb-4">
            <Link
              to={profile.role === "student" ? "/student" : "/tutor"}
              className="mr-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
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
              placeholder="Search..."
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setActiveChat(contact.id)}
              className={`w-full flex items-start p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${
                activeChat === contact.id ? "bg-indigo-50/50" : ""
              }`}
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg mr-3 shrink-0 ${
                  contact.role === "tutor"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {contact.full_name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {contact.full_name || "Unnamed User"}
                </h3>
                <p className="text-xs text-indigo-600 font-medium mb-1">
                  {contact.role}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col h-[60vh] md:h-full bg-gray-50">
        {activeUser ? (
          <>
            <header className="h-16 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold mr-3 shrink-0 ${
                    activeUser.role === "tutor"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {activeUser.full_name?.[0] || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 leading-none">
                    {activeUser.full_name || "Unnamed User"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeUser.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-3 text-gray-400">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages
                .filter(
                  (msg) =>
                    (msg.sender_id === user.id &&
                      msg.receiver_id === activeUser.id) ||
                    (msg.sender_id === activeUser.id &&
                      msg.receiver_id === user.id),
                )
                .map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] lg:max-w-[60%] rounded-2xl px-5 py-3 shadow-sm ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-sm"
                            : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
              <form
                onSubmit={handleSend}
                className="flex items-end gap-2 max-w-4xl mx-auto"
              >
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
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a contact to start chatting
          </div>
        )}
      </main>
    </div>
  );
}
