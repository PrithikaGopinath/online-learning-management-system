const MessageBubble = ({ message }) => {
    const isStudent = message.sender === "student";

    return (
        <div className={`bubble ${isStudent ? "student" : "tutor"}`}>
            {message.text}
        </div>
    );
};

export default MessageBubble;

