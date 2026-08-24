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

  return (
    <div className="flex h-screen bg-slate-50 p-4 text-slate-900">
      <aside className="w-64 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            StudyHubAI
          </div>
        </div>

        <button
          onClick={startNewChat}
          className="mb-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          + New Chat
        </button>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {chats.length === 0 && (
            <p className="text-sm text-slate-400 text-center mt-6">
              No chats yet
            </p>
          )}

          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`group flex items-center justify-between rounded-xl border px-3 py-2.5 transition ${
                currentChatId === chat._id
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <button
                onClick={() => fetchChatById(chat._id)}
                className="flex-1 truncate text-left text-sm font-medium text-slate-700"
              >
                {chat.title}
              </button>
              <button
                onClick={() => handleDeleteChat(chat._id)}
                className="ml-2 hidden text-slate-400 hover:text-red-500 group-hover:block"
                aria-label="Delete chat"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="ml-4 flex flex-1 flex-col gap-4">
        <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="text-lg font-semibold text-slate-800">
            {currentChatId
              ? chats.find((c) => c._id === currentChatId)?.title ||
                "Conversation"
              : "New Conversation"}
          </div>
        </header>

     <section
  aria-live="polite"
  className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
>
  {messages.length === 0 && (
    <div className="flex flex-1 items-center justify-center text-slate-400 text-sm">
      Ask me anything about your studies to get started.
    </div>
  )}

  {messages.map((message, index) => (
    <div
      key={message._id || index}
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={[
          "max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm",
          message.role === "user"
            ? "bg-blue-600 text-white"
            : "border border-slate-200 bg-slate-50 text-slate-800",
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
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  ))}

  {loading && (
    <div className="flex justify-start">
      <div className="max-w-[75%] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
        Thinking...
      </div>
    </div>
  )}

  <div ref={messagesEndRef} />
</section>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              aria-label="Message input"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={onSend}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
