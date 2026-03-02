import { useState } from "react";


export default function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false);

    // Mock notifications
    const [notifications] = useState([
        { id: 1, text: "New grade posted for Database Systems", time: "2 hours ago", unread: true },
        { id: 2, text: "Assignment 2 due tomorrow", time: "5 hours ago", unread: true },
        { id: 3, text: "Welcome to LearnHub VLE!", time: "2 days ago", unread: false }
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="notifications-wrapper">
            <button
                className="bell-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                🔔
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notifications-dropdown">
                    <div className="dropdown-header">
                        <h4>Notifications</h4>
                    </div>
                    <div className="dropdown-list">
                        {notifications.length === 0 ? (
                            <p className="no-notifications">No new notifications</p>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                                    <p className="notif-text">{notif.text}</p>
                                    <span className="notif-time">{notif.time}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="dropdown-footer">
                        <button className="mark-read-btn">Mark all as read</button>
                    </div>
                </div>
            )}
        </div>
    );
}
