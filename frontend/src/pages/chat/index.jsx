import { Routes, Route } from "react-router-dom";
import ChatLayout from "./ChatLayout";

export default function ChatRoutes() {
    return (
        <Routes>
            <Route path="/" element={<ChatLayout />} />
            <Route path=":conversationId" element={<ChatLayout />} />
        </Routes>
    );
}



