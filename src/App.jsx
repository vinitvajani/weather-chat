import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { sendMessageStream } from "./utils/api";

export default function App() {
  const [chats, setChats] = useState(() => JSON.parse(localStorage.getItem("chats")) || []);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  function startNewChat() {
    const newChat = { id: Date.now(), title: "New Chat", messages: [] };
    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    setInput("");
    setError(null);
  }

  function selectChat(id) {
    setCurrentChatId(id);
    setError(null);
    setInput("");
  }

  async function handleSendMessage() {
    if (!input.trim() || currentChatId === null || isTyping) return;
    
    setError(null);
    const trimmedInput = input.trim();
    const userMessage = { role: "user", content: trimmedInput };
    const aiMessage = { role: "assistant", content: "" };

    // Add user message and placeholder AI message
    setChats(prev =>
      prev.map(chat =>
        chat.id === currentChatId
          ? {
              ...chat,
              title: chat.title === "New Chat" ? trimmedInput.slice(0, 30) + (trimmedInput.length > 30 ? "..." : "") : chat.title,
              messages: [...chat.messages, userMessage, aiMessage],
            }
          : chat
      )
    );

    setInput("");
    setIsTyping(true);

    let accumulatedText = "";
    try {
      for await (const chunk of sendMessageStream(trimmedInput)) {
        accumulatedText += chunk;
        setChats(prev =>
          prev.map(chat =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg, idx) =>
                    idx === chat.messages.length - 1
                      ? { ...msg, content: accumulatedText }
                      : msg
                  ),
                }
              : chat
          )
        );
      }
    } catch (err) {
      setError("Error fetching response: " + err.message);
      // Remove the empty AI message if there was an error
      setChats(prev =>
        prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: chat.messages.slice(0, -1) }
            : chat
        )
      );
    } finally {
      setIsTyping(false);
    }
  }

  const currentChat = chats.find(chat => chat.id === currentChatId);

  return (
    <div className="app-container">
      <Sidebar
        chats={chats}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        currentChatId={currentChatId}
      />
      <ChatWindow
        messages={currentChat?.messages || []}
        input={input}
        setInput={setInput}
        onSend={handleSendMessage}
        isTyping={isTyping}
        hasActiveChat={currentChatId !== null}
      />
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}