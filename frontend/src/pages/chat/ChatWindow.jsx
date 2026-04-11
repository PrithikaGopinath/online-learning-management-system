import { useParams } from "react-router-dom";
import { useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const conversations = {
  1: {
    tutor: "Mr. John",
    course: "Maths",
    messages: [
      { id: 1, sender: "student", text: "Sir I have a doubt" },
      { id: 2, sender: "tutor", text: "Sure, tell me." },
    ],
  },
  2: {
    tutor: "Ms. Sarah",
    course: "Science",
    messages: [
      { id: 1, sender: "student", text: "Miss I need help" },
      { id: 2, sender: "tutor", text: "Send your doubt." },
    ],
  },
};

export default function ChatWindow() {
  const { id } = useParams(); // ✅ FIXED PARAM NAME
  const chat = conversations[id];

  const [messages, setMessages] = useState(chat.messages);

  const handleSend = (text) => {
    const newMessage = {
      id: Date.now(),
      sender: "student",
      text,
    };

    setMessages([...messages, newMessage]);
  };

  return (
    <>
      <div className="chat-header">
        <h3>{chat.tutor}</h3>
        <span>{chat.course}</span>
      </div>

      <div className="messages">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      <MessageInput onSend={handleSend} />
    </>
  );
}
