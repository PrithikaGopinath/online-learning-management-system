import { Link } from "react-router-dom";

const ChatList = () => {
  const conversations = [
    {
      id: 1,
      tutorName: "Mr. John",
      course: "Maths",
      lastMessage: "Sure, I can help!",
    },
    {
      id: 2,
      tutorName: "Ms. Sarah",
      course: "Science",
      lastMessage: "Send your doubt.",
    },
  ];

  return (
    <div className="chat-list">
      <h2>Your Chats</h2>

      {conversations.map((c) => (
        <Link key={c.id} to={`/messages/${c.id}`} className="chat-item">
          <div className="chat-title">{c.tutorName}</div>
          <div className="chat-sub">{c.course}</div>
          <div className="chat-last">{c.lastMessage}</div>
        </Link>
      ))}
    </div>
  );
};

export default ChatList;
