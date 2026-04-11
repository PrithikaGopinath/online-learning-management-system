import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../config/supabase";

export default function Chat() {
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
      if (profileData && profileData.role === "tutor") {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
          .order("full_name");
        setUsers(data || []);
      } else {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "tutor")
          .order("full_name");
        setUsers(data || []);
      }
      setLoading(false);
    };
    getData();
  }, []);

  useEffect(() => {
    if (!selectedUser || !profile) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${profile.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${profile.id})`,
        )
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();
    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === profile.id &&
              msg.receiver_id === selectedUser.id) ||
            (msg.sender_id === selectedUser.id &&
              msg.receiver_id === profile.id)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [selectedUser, profile]);

  useEffect(() => {
    messagesEndRef.current &&
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    await supabase.from("messages").insert({
      sender_id: profile.id,
      receiver_id: selectedUser.id,
      message: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  if (loading) return <div style={styles.loading}>Loading chat...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>💬 Messages</h2>
          <p style={styles.sidebarSub}>
            {profile && profile.role === "tutor"
              ? "Your Students"
              : "Your Tutors"}
          </p>
        </div>
        <div style={styles.userList}>
          {users.length === 0 ? (
            <p style={styles.noUsers}>
              No {profile && profile.role === "tutor" ? "students" : "tutors"}{" "}
              found
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                style={{
                  ...styles.userItem,
                  background:
                    selectedUser && selectedUser.id === u.id
                      ? "#667eea"
                      : "transparent",
                  color:
                    selectedUser && selectedUser.id === u.id ? "white" : "#333",
                }}
              >
                <div
                  style={{
                    ...styles.avatar,
                    background:
                      selectedUser && selectedUser.id === u.id
                        ? "white"
                        : "#667eea",
                    color:
                      selectedUser && selectedUser.id === u.id
                        ? "#667eea"
                        : "white",
                  }}
                >
                  {u.full_name && u.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "2px",
                    }}
                  >
                    {u.full_name}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color:
                        selectedUser && selectedUser.id === u.id
                          ? "rgba(255,255,255,0.7)"
                          : "#888",
                    }}
                  >
                    {u.role === "student" ? `Grade ${u.grade}` : "Tutor"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.chatArea}>
        {!selectedUser ? (
          <div style={styles.noChat}>
            <p style={{ fontSize: "64px", marginBottom: "16px" }}>💬</p>
            <h3
              style={{ fontSize: "20px", color: "#333", marginBottom: "8px" }}
            >
              Select a conversation
            </h3>
            <p style={{ fontSize: "14px", color: "#888" }}>
              Choose someone from the left to start chatting
            </p>
          </div>
        ) : (
          <>
            <div style={styles.chatHeader}>
              <div style={styles.chatAvatar}>
                {selectedUser.full_name &&
                  selectedUser.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "17px",
                    color: "#333",
                    marginBottom: "2px",
                  }}
                >
                  {selectedUser.full_name}
                </h3>
                <p style={{ fontSize: "13px", color: "#888" }}>
                  {selectedUser.role === "student"
                    ? `Student — Grade ${selectedUser.grade}`
                    : "Tutor"}
                </p>
              </div>
            </div>
            <div style={styles.messages}>
              {messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#aaa",
                    marginTop: "40px",
                  }}
                >
                  No messages yet. Say hello! 👋
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === profile.id;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        marginBottom: "8px",
                        alignItems: "flex-end",
                        gap: "8px",
                      }}
                    >
                      {!isMe && (
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "#667eea",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "700",
                            flexShrink: 0,
                          }}
                        >
                          {selectedUser.full_name &&
                            selectedUser.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        style={{
                          maxWidth: "65%",
                          padding: "10px 14px",
                          borderRadius: "16px",
                          background: isMe ? "#667eea" : "white",
                          color: isMe ? "white" : "#333",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                          borderBottomRightRadius: isMe ? "4px" : "16px",
                          borderBottomLeftRadius: isMe ? "16px" : "4px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "15px",
                            lineHeight: "1.5",
                            marginBottom: "4px",
                          }}
                        >
                          {msg.message}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            textAlign: "right",
                            color: isMe ? "rgba(255,255,255,0.7)" : "#aaa",
                          }}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <form style={styles.inputArea} onSubmit={handleSend}>
              <input
                style={styles.messageInput}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                style={styles.sendBtn}
                type="submit"
                disabled={sending || !newMessage.trim()}
              >
                ➤
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "calc(100vh - 64px)",
    overflow: "hidden",
  },
  loading: { textAlign: "center", padding: "40px", fontSize: "18px" },
  sidebar: {
    width: "280px",
    background: "white",
    borderRight: "1px solid #eee",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  sidebarHeader: { padding: "20px", borderBottom: "1px solid #eee" },
  sidebarTitle: { fontSize: "18px", color: "#333", marginBottom: "4px" },
  sidebarSub: { fontSize: "13px", color: "#888" },
  userList: { flex: 1, overflowY: "auto" },
  noUsers: { padding: "20px", color: "#aaa", textAlign: "center" },
  userItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    cursor: "pointer",
    borderRadius: "8px",
    margin: "4px 8px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  noChat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px 24px",
    background: "white",
    borderBottom: "1px solid #eee",
    flexShrink: 0,
  },
  chatAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#667eea",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    background: "#f5f6fa",
  },
  inputArea: {
    display: "flex",
    gap: "12px",
    padding: "16px 24px",
    background: "white",
    borderTop: "1px solid #eee",
    flexShrink: 0,
  },
  messageInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "24px",
    border: "1px solid #ddd",
    fontSize: "15px",
    outline: "none",
  },
  sendBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#667eea",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },
};
