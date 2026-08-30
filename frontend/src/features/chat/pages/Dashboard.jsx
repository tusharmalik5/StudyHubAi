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
    currentChatPdf,
    currentChatPdfName,
    pdfUploadStatus,
    loading,
    fetchChats,
    fetchChatById,
    handleSendMessage,
    handleDeleteChat,
    handleStartNewChat,
    handleUploadPdf,
  } = useChat();

  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sidebar resize
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);

  // Microphone
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const isDark = theme === "dark";

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Apply theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sidebar resize logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 420) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";
    let baseText = "";

    recognition.onstart = () => {
      finalTranscript = "";
      baseText = "";
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setInput((prev) => {
        if (!baseText) baseText = prev ? prev.trim() + " " : "";
        return (baseText + finalTranscript + interimTranscript).trimStart();
      });
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

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

  function toggleListening() {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      try {
        recognition.stop();
      } catch (e) {}
    } else {
      setIsListening(true);
      try {
        recognition.start();
      } catch (err) {
        try {
          recognition.stop();
          setTimeout(() => {
            recognition.start();
            setIsListening(true);
          }, 300);
        } catch (e) {
          setIsListening(false);
        }
      }
    }
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function triggerFileUpload() {
    fileInputRef.current?.click();
  }

  async function onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Sirf PDF files allowed hain");
      e.target.value = "";
      return;
    }

    await handleUploadPdf(file);
    e.target.value = "";
  }

  const isFreshChat = !currentChatId && messages.length === 0;

  // Mic button component (reuse)
  const MicButton = () => (
    <button
      onClick={toggleListening}
      className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
        isListening
          ? "bg-red-500/25 text-red-400 scale-110"
          : isDark
          ? "text-[#858178] hover:bg-[#2a2823] hover:text-white"
          : "text-[#6b6560] hover:bg-[#eae7e1] hover:text-[#1a1915]"
      }`}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening && (
        <>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50"></span>
          <span className="absolute inline-flex h-[140%] w-[140%] animate-pulse rounded-full bg-red-400/20"></span>
        </>
      )}
      {isListening ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="relative z-10">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      )}
    </button>
  );

  // PDF upload button (reuse)
  const PdfButton = () => (
    <button
      onClick={triggerFileUpload}
      disabled={pdfUploadStatus === "uploading"}
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
        isDark
          ? "text-[#858178] hover:bg-[#2a2823] hover:text-white"
          : "text-[#6b6560] hover:bg-[#eae7e1] hover:text-[#1a1915]"
      }`}
      title="Upload PDF"
    >
      {pdfUploadStatus === "uploading" ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05 12.25 20.24a5.5 5.5 0 0 1-7.78-7.78L13.46 3.28a3.5 3.5 0 1 1 4.95 4.95L9.42 17.22a1.5 1.5 0 0 1-2.12-2.12l8.49-8.49" />
        </svg>
      )}
    </button>
  );

  // PDF attachment chip — shown inside the input box, above the textarea
  const PdfChip = () => {
    if (pdfUploadStatus === "uploading") {
      return (
        <div
          className={`flex items-center gap-2 mx-2 mt-2 mb-1 px-3 py-1.5 rounded-lg text-[12.5px] w-fit ${
            isDark ? "bg-[#2a2823] text-[#c9c6bd]" : "bg-[#f3f0ea] text-[#6b6560]"
          }`}
        >
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" />
          </svg>
          Uploading PDF...
        </div>
      );
    }

    if (currentChatPdf && currentChatPdfName) {
      return (
        <div
          className={`flex items-center gap-2 mx-2 mt-2 mb-1 px-3 py-1.5 rounded-lg text-[12.5px] w-fit ${
            isDark ? "bg-[#2a2823] text-[#c9c6bd]" : "bg-[#f3f0ea] text-[#6b6560]"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <span className="truncate max-w-[200px]">{currentChatPdfName}</span>
        </div>
      );
    }

    if (pdfUploadStatus === "failed") {
      return (
        <div className="mx-2 mt-2 mb-1 px-3 py-1.5 rounded-lg text-[12.5px] w-fit text-red-400 bg-red-500/10">
          PDF upload fail ho gaya, dobara try karo
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`flex h-screen font-sans antialiased transition-colors duration-300 ${
        isDark ? "bg-[#141311] text-[#e8e6e1]" : "bg-[#f7f5f0] text-[#1a1915]"
      }`}
    >
      {/* Hidden file input for PDF upload */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={onFileSelected}
        className="hidden"
      />

      {/* ── Sidebar ── */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className={`relative flex flex-col border-r flex-shrink-0 transition-colors duration-300 ${
          isDark ? "bg-[#1c1b18] border-[#2e2c27]" : "bg-white border-[#e8e4dc]"
        }`}
      >
        {/* Brand */}
        <div className="px-5 pt-5 pb-4">
          <span className="text-[20px] font-bold tracking-tight">
            <span className={isDark ? "text-[#f5f3ee]" : "text-[#1a1915]"}>
              StudyHub
            </span>
            <span className="bg-gradient-to-r from-[#c96442] to-[#e07a55] bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </div>

        {/* New chat */}
        <div className="px-3 mb-3">
          <button
            onClick={startNewChat}
            className={`w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-all duration-200 active:scale-[0.98] ${
              isDark
                ? "border-[#3a372f] bg-[#23211d] text-[#e8e6e1] hover:bg-[#2b2924] hover:border-[#4a473e]"
                : "border-[#e0dbd3] bg-[#f3f0ea] text-[#1a1915] hover:bg-[#ebe7e0]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          <p className={`px-2.5 pt-1 pb-2 text-[11px] font-medium uppercase tracking-widest ${isDark ? "text-[#6f6b5f]" : "text-[#9a948a]"}`}>
            Recents
          </p>

          {chats.length === 0 && (
            <p className={`px-2.5 py-4 text-[13px] ${isDark ? "text-[#5c584e]" : "text-[#a39e94]"}`}>
              No conversations yet
            </p>
          )}

          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150 ${
                currentChatId === chat._id
                  ? isDark
                    ? "bg-[#2a2823] text-[#f5f3ee] shadow-sm"
                    : "bg-[#ebe7e0] text-[#1a1915] shadow-sm"
                  : isDark
                  ? "text-[#b0ada4] hover:bg-[#23211d] hover:text-[#e8e6e1]"
                  : "text-[#6b6560] hover:bg-[#f3f0ea] hover:text-[#1a1915]"
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
                className={`ml-2 opacity-0 group-hover:opacity-100 transition-all duration-150 p-0.5 rounded ${
                  isDark ? "text-[#6f6b5f] hover:text-red-400" : "text-[#9a948a] hover:text-red-500"
                }`}
                aria-label="Delete chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className="px-3 mb-1">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-all duration-150 ${
              isDark
                ? "text-[#c9c6bd] hover:bg-[#23211d]"
                : "text-[#6b6560] hover:bg-[#f3f0ea]"
            }`}
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>

        {/* User / Auth */}
        <div className={`p-3 border-t ${isDark ? "border-[#2e2c27]" : "border-[#e8e4dc]"}`}>
          <button
            onClick={onAuthClick}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-all duration-150 ${
              isDark
                ? "text-[#c9c6bd] hover:bg-[#23211d]"
                : "text-[#6b6560] hover:bg-[#f3f0ea]"
            }`}
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
            isResizing ? "bg-[#c96442]" : isDark ? "bg-transparent hover:bg-[#3a372f]" : "bg-transparent hover:bg-[#d6d0c6]"
          }`}
        />
      </aside>

      {/* ── Main ── */}
      <main className="flex flex-1 flex-col min-w-0">
        {isFreshChat ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div className={`mb-3 h-12 w-12 rounded-2xl flex items-center justify-center border ${
              isDark
                ? "bg-gradient-to-br from-[#c96442]/20 to-[#c96442]/5 border-[#c96442]/20"
                : "bg-[#c96442]/10 border-[#c96442]/20"
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c96442" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </div>

            <h1 className={`mb-2 text-[28px] font-medium tracking-tight ${isDark ? "text-[#f5f3ee]" : "text-[#1a1915]"}`}>
              What are we studying today?
            </h1>
            <p className={`mb-10 text-[15px] ${isDark ? "text-[#7a766c]" : "text-[#8a847a]"}`}>
              Ask anything — notes, concepts, or practice questions.
            </p>

            <div className="w-full max-w-3xl">
              <div className={`rounded-2xl border p-1.5 shadow-xl transition-colors ${
                isDark
                  ? "border-[#2e2c27] bg-[#1c1b18] shadow-black/20 focus-within:border-[#3a372f]"
                  : "border-[#e0dbd3] bg-white shadow-black/5 focus-within:border-[#c96442]/40"
              }`}>
                <PdfChip />
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening..." : "Ask me anything about your studies..."}
                  rows={2}
                  className={`w-full resize-none bg-transparent px-4 py-3 text-[15px] focus:outline-none leading-relaxed ${
                    isDark
                      ? "text-[#e8e6e1] placeholder:text-[#5c584e]"
                      : "text-[#1a1915] placeholder:text-[#a39e94]"
                  }`}
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="flex items-center gap-1">
                    <PdfButton />
                    <MicButton />
                  </div>
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
            <header className={`border-b px-6 py-3.5 flex items-center ${isDark ? "border-[#2e2c27]" : "border-[#e8e4dc]"}`}>
              <div className={`text-[14px] font-medium truncate ${isDark ? "text-[#c9c6bd]" : "text-[#6b6560]"}`}>
                {chats.find((c) => c._id === currentChatId)?.title || "Conversation"}
              </div>
            </header>

            <section
              aria-live="polite"
              className="flex-1 overflow-y-auto px-6 py-8"
            >
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
                {messages.map((message, index) => (
                  <div
                    key={message._id || index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={[
                        "rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
                        message.role === "user"
                          ? isDark
                            ? "max-w-[85%] bg-[#2a2823] text-[#f5f3ee] shadow-sm"
                            : "max-w-[85%] bg-[#ebe7e0] text-[#1a1915] shadow-sm"
                          : isDark
                          ? "w-full text-[#e8e6e1]"
                          : "w-full text-[#1a1915]",
                      ].join(" ")}
                    >
                      {message.imageUrl ? (
                        <img src={message.imageUrl} alt="Generated" className="rounded-xl max-w-full" />
                      ) : message.role === "user" ? (
                        message.content
                      ) : (
                        <div className={`prose prose-sm max-w-none prose-p:leading-relaxed ${
                          isDark ? "prose-invert prose-headings:text-[#f5f3ee]" : "prose-headings:text-[#1a1915]"
                        }`}>
                          <ReactMarkdown components={{ code: CodeBlock }}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-[13.5px] ${isDark ? "text-[#7a766c]" : "text-[#8a847a]"}`}>
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                      </span>
                      Thinking
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </section>

            {/* Input bar */}
            <div className="px-6 pb-6 pt-1">
              <div className="mx-auto w-full max-w-3xl">
                <div className={`rounded-2xl border p-1.5 shadow-lg transition-colors ${
                  isDark
                    ? "border-[#2e2c27] bg-[#1c1b18] shadow-black/15 focus-within:border-[#3a372f]"
                    : "border-[#e0dbd3] bg-white shadow-black/5 focus-within:border-[#c96442]/40"
                }`}>
                  <PdfChip />
                  <div className="flex items-end gap-2">
                    <PdfButton />
                    <MicButton />
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isListening ? "Listening..." : "Type your message..."}
                      rows={1}
                      className={`flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] focus:outline-none leading-relaxed max-h-32 ${
                        isDark
                          ? "text-[#e8e6e1] placeholder:text-[#5c584e]"
                          : "text-[#1a1915] placeholder:text-[#a39e94]"
                      }`}
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
            </div>
          </>
        )}
      </main>
    </div>
  );
}