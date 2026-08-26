import { useEffect, useRef, useState } from "react";
import { useChat } from "../hook/useChat.js";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../auth/hook/useAuth.js";
import { useNavigate } from "react-router";
import CodeBlock from "../../components/CodeBlock.jsx";

export default function Dashboard() {
  const {
    chats,
    messages,
    currentChatId,
    loading,
    fetchChats,
    fetchChatById,
    handleSendMessage,
    handleDeleteChat,
    handleStartNewChat,
  } = useChat();

  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Sidebar resize
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 420) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function onSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    await handleSendMessage(trimmed);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  function startNewChat() {
    handleStartNewChat();
  }

  async function onAuthClick() {
    if (user) {
      const success = await handleLogout();
      if (success) navigate("/login");
    } else {
      navigate("/login");
    }
  }

  const isFreshChat = !currentChatId && messages.length === 0;

  return (
    <div className="flex h-screen bg-[#141311] text-[#e8e6e1] font-sans antialiased">
      {/* ── Sidebar ── */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="relative flex flex-col bg-[#1c1b18] border-r border-[#2e2c27] flex-shrink-0"
      >
        {/* Brand */}
        <div className="px-5 pt-5 pb-4">
          <span className="text-[20px] font-bold tracking-tight">
            <span className="text-[#f5f3ee]">StudyHub</span>
            <span className="bg-gradient-to-r from-[#c96442] to-[#e07a55] bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </div>

        {/* New chat */}
        <div className="px-3 mb-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#3a372f] bg-[#23211d] px-3 py-2.5 text-[13px] font-medium text-[#e8e6e1] transition-all duration-200 hover:bg-[#2b2924] hover:border-[#4a473e] active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5 scrollbar-thin">
          <p className="px-2.5 pt-1 pb-2 text-[11px] font-medium text-[#6f6b5f] uppercase tracking-widest">
            Recents
          </p>

          {chats.length === 0 && (
            <p className="px-2.5 py-4 text-[13px] text-[#5c584e]">
              No conversations yet
            </p>
          )}

          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150 ${
                currentChatId === chat._id
                  ? "bg-[#2a2823] text-[#f5f3ee] shadow-sm"
                  : "text-[#b0ada4] hover:bg-[#23211d] hover:text-[#e8e6e1]"
              }`}
              onClick={() => fetchChatById(chat._id)}
            >
              <span className="flex-1 truncate text-[13.5px] leading-snug">
                {chat.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat._id);
                }}
                className="ml-2 opacity-0 group-hover:opacity-100 text-[#6f6b5f] hover:text-red-400 transition-all duration-150 p-0.5 rounded"
                aria-label="Delete chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* User / Auth */}
        <div className="p-3 border-t border-[#2e2c27]">
          <button
            onClick={onAuthClick}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-[#c9c6bd] hover:bg-[#23211d] transition-all duration-150"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#c96442] to-[#a34d2e] text-[12px] font-semibold text-white shadow-sm">
              {user ? user.username?.[0]?.toUpperCase() : "U"}
            </span>
            <span className="truncate font-medium">
              {user ? user.username : "Login"}
            </span>
          </button>
        </div>

        {/* Drag Handle */}
        <div
          onMouseDown={startResizing}
          className={`absolute top-0 right-0 h-full w-1.5 cursor-col-resize transition-colors ${
            isResizing ? "bg-[#c96442]" : "bg-transparent hover:bg-[#3a372f]"
          }`}
        />
      </aside>

      {/* ── Main ── */}
      <main className="flex flex-1 flex-col min-w-0">
        {isFreshChat ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div className="mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br from-[#c96442]/20 to-[#c96442]/5 flex items-center justify-center border border-[#c96442]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c96442"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </div>

            <h1 className="mb-2 text-[28px] font-medium tracking-tight text-[#f5f3ee]">
              What are we studying today?
            </h1>
            <p className="mb-10 text-[15px] text-[#7a766c]">
              Ask anything — notes, concepts, or practice questions.
            </p>

            <div className="w-full max-w-3xl">
              <div className="rounded-2xl border border-[#2e2c27] bg-[#1c1b18] p-1.5 shadow-xl shadow-black/20 focus-within:border-[#3a372f] transition-colors">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your studies..."
                  rows={2}
                  className="w-full resize-none bg-transparent px-4 py-3 text-[15px] text-[#e8e6e1] placeholder:text-[#5c584e] focus:outline-none leading-relaxed"
                />
                <div className="flex justify-end px-2 pb-2">
                  <button
                    onClick={onSend}
                    disabled={loading || !input.trim()}
                    className="rounded-xl bg-[#c96442] px-5 py-2 text-[13.5px] font-medium text-white transition-all duration-200 hover:bg-[#b8582f] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] shadow-md shadow-[#c96442]/25"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <header className="border-b border-[#2e2c27] px-6 py-3.5 flex items-center">
              <div className="text-[14px] font-medium text-[#c9c6bd] truncate">
                {chats.find((c) => c._id === currentChatId)?.title ||
                  "Conversation"}
              </div>
            </header>

            <section
              aria-live="polite"
              className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin scrollbar-thumb-[#3a372f] scrollbar-track-transparent"
            >
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
                {messages.map((message, index) => (
                  <div
                    key={message._id || index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={[
                        "rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
                        message.role === "user"
                          ? "max-w-[85%] bg-[#2a2823] text-[#f5f3ee] shadow-sm"
                          : "w-full text-[#e8e6e1]",
                      ].join(" ")}
                    >
                      {message.imageUrl ? (
                        <img
                          src={message.imageUrl}
                          alt="Generated"
                          className="rounded-xl max-w-full"
                        />
                      ) : message.role === "user" ? (
                        message.content
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-[#f5f3ee]">
                          <ReactMarkdown
                            components={{
                              code: CodeBlock,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[13.5px] text-[#7a766c]">
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7a766c] animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7a766c] animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7a766c] animate-bounce [animation-delay:300ms]" />
                      </span>
                      Thinking
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </section>

            <div className="px-6 pb-6 pt-1">
              <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#2e2c27] bg-[#1c1b18] p-1.5 shadow-lg shadow-black/15 focus-within:border-[#3a372f] transition-colors">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-4 py-2.5 text-[15px] text-[#e8e6e1] placeholder:text-[#5c584e] focus:outline-none leading-relaxed max-h-32"
                  />
                  <button
                    onClick={onSend}
                    disabled={loading || !input.trim()}
                    className="mb-1 mr-1 rounded-xl bg-[#c96442] px-4 py-2 text-[13.5px] font-medium text-white transition-all duration-200 hover:bg-[#b8582f] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] shadow-md shadow-[#c96442]/20"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}