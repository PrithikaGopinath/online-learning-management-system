import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

export default function ChatLayout() {
  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <ChatList />
      </aside>

      <main className="chat-main">
        <ChatWindow />
      </main>
    </div>
  );
}
