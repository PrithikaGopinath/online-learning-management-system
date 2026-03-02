import { useState } from "react";

const MessageInput = ({ onSend }) => {
    const [text, setText] = useState("");

    const sendMessage = () => {
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };

    return (
        <div className="message-input">
            <input
                type="text"
                placeholder="Type your message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default MessageInput;


