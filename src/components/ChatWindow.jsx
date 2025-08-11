import { useEffect, useRef } from "react";

export default function ChatWindow({ messages, input, setInput, onSend, isTyping, hasActiveChat }) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when starting a new chat
  useEffect(() => {
    if (hasActiveChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasActiveChat]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleSendClick = () => {
    onSend();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Show empty state when no chat is selected
  if (!hasActiveChat) {
    return (
      <div className="chat-window">
        <div className="empty-state">
          <div>
            <p style={{ marginBottom: '8px', fontSize: '18px', fontWeight: '500' }}>
              Welcome to Weather Chat Agent
            </p>
            <p style={{ color: '#666666' }}>
              Start a new conversation to get weather information and insights
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get the last message to check if AI is responding
  const lastMessage = messages[messages.length - 1];
  const isAIResponding = lastMessage && lastMessage.role === "assistant" && lastMessage.content.length > 0;

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.length === 0 && !isTyping && (
          <div style={{
            textAlign: 'center',
            color: '#999999',
            fontSize: '15px',
            padding: '20px',
            marginTop: '40px'
          }}>
            Ask me anything about the weather!
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role === "user" ? "user" : "assistant"}`}
          >
            {msg.content}
          </div>
        ))}

        {/* Show typing indicator only when isTyping is true AND AI hasn't started responding */}
        {isTyping && !isAIResponding && (
          <div className="typing-indicator">
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="input-field"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isTyping}
            rows={2}
          />
          <button
            onClick={handleSendClick}
            disabled={isTyping || !input.trim()}
            className="send-button"
            title="Send message"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}