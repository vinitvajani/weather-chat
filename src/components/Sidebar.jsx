export default function Sidebar({ chats, onNewChat, onSelectChat, currentChatId }) {
  return (
    <div className="sidebar">
      <button
        onClick={onNewChat}
        className="new-chat-btn"
      >
        + New Chat
      </button>
      
      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="no-chats">
            No conversations yet
          </div>
        ) : (
          chats
            .slice()
            .reverse() // Show most recent chats first
            .map(chat => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
                title={chat.title}
              >
                {chat.title}
              </div>
            ))
        )}
      </div>
    </div>
  );
}