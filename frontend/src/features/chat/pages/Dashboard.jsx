import { useEffect, useRef, useState } from "react";
import { useChat } from "../hook/useChat.js";
import ReactMarkdown from "react-markdown";

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

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

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

  const isFreshChat = !currentChatId && messages.length === 0;

  return (
    <div className="flex h-screen bg-[#1a1915] text-[#e8e6e1]">
      <aside className="w-64 flex flex-col bg-[#211f1c] border-r border-[#3a372f]">
        <div className="p-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-[#f0eee6] tracking-tight">
            StudyHubAI
          </div>
        </div>

        <div className="px-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 rounded-lg border border-[#4a473e] px-3 py-2 text-sm text-[#e8e6e1] transition hover:bg-[#2b2924]"
          >
            <span className="text-base leading-none">+</span>
            New chat
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-3 space-y-1">
          <p className="px-2 pb-1 text-xs font-medium text-[#8a8577] uppercase tracking-wide">
            Recents
          </p>

          {chats.length === 0 && (
            <p className="px-2 py-3 text-sm text-[#6f6b5f]">No chats yet</p>
          )}

          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition ${
                currentChatId === chat._id
                  ? "bg-[#3a372f] text-[#f0eee6]"
                  : "text-[#c9c6bd] hover:bg-[#2b2924]"
              }`}
              onClick={() => fetchChatById(chat._id)}
            >
              <span className="flex-1 truncate text-sm">{chat.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat._id);
                }}
                className="ml-2 hidden text-[#8a8577] hover:text-red-400 group-hover:block"
                aria-label="Delete chat"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[#3a372f]">
          <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#c9c6bd] hover:bg-[#2b2924] transition">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c96442] text-xs font-semibold text-white">
              U
            </span>
            Login
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {isFreshChat ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <h1 className="mb-8 text-3xl font-medium text-[#f0eee6]">
              What are we studying today?
            </h1>

            <div className="w-full max-w-2xl">
              <div className="rounded-2xl border border-[#3a372f] bg-[#211f1c] p-3 shadow-lg">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your studies..."
                  rows={2}
                  className="w-full resize-none bg-transparent px-2 py-1 text-[15px] text-[#e8e6e1] placeholder:text-[#726e62] focus:outline-none"
                />
                <div className="flex justify-end px-1 pt-1">
                  <button
                    onClick={onSend}
                    disabled={loading}
                    className="rounded-lg bg-[#c96442] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b8582f] disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <header className="border-b border-[#3a372f] px-6 py-4">
              <div className="text-sm font-medium text-[#c9c6bd]">
                {chats.find((c) => c._id === currentChatId)?.title ||
                  "Conversation"}
              </div>
            </header>

            <section
              aria-live="polite"
              className="flex-1 overflow-y-auto px-6 py-6"
            >
              <div className="mx-auto flex max-w-3xl flex-col gap-6">
                {messages.map((message, index) => (
                  <div
                    key={message._id || index}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={[
                        "max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
                        message.role === "user"
                          ? "bg-[#3a372f] text-[#f0eee6]"
                          : "text-[#e8e6e1]",
                      ].join(" ")}
                    >
                      {message.imageUrl ? (
                        <img
                          src={message.imageUrl}
                          alt="Generated"
                          className="rounded-lg max-w-full"
                        />
                      ) : message.role === "user" ? (
                        message.content
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm text-[#8a8577]">
                      Thinking...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </section>

            <div className="px-6 pb-6">
              <div className="mx-auto max-w-3xl rounded-2xl border border-[#3a372f] bg-[#211f1c] p-3 shadow-lg">
                <div className="flex items-end gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-[#e8e6e1] placeholder:text-[#726e62] focus:outline-none"
                  />
                  <button
                    onClick={onSend}
                    disabled={loading}
                    className="rounded-lg bg-[#c96442] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b8582f] disabled:opacity-50"
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