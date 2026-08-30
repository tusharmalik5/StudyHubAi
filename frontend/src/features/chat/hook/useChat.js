import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";

import {
  getAllChats,
  getChatById,
  sendMessage,
  deleteChat,
  uploadPdf,
  createEmptyChat
} from "../service/chat.api.js";

import {
  setChats,
  setMessages,
  addMessage,
  setCurrentChatId,
  setCurrentChatPdf,
  setPdfUploadStatus,
  addNewChat,
  removeChat,
  setLoading,
  setError,
  startNewChat,
  addMessageChunk,
  setCurrentChatPdfName
} from "../chat.slice.js";

export function useChat() {
  const dispatch = useDispatch();

  const { chats, messages, currentChatId, currentChatPdf, currentChatPdfName, pdfUploadStatus, loading, error } = useSelector(
    (state) => state.chat
  );

  // =========================
  // STREAMING QUEUE
  // =========================

  const chunkQueue = useRef([]);
  const isProcessing = useRef(false);

  const processQueue = async () => {
    if (isProcessing.current) return;

    isProcessing.current = true;

    while (chunkQueue.current.length > 0) {
      const piece = chunkQueue.current.shift();

      dispatch(addMessageChunk(piece));

      // Typing speed
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    isProcessing.current = false;
  };

  // =========================
  // FETCH ALL CHATS
  // =========================

  async function fetchChats() {
    try {
      dispatch(setLoading(true));

      const data = await getAllChats();

      dispatch(setChats(data.chats));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }

  // =========================
  // FETCH CHAT BY ID
  // =========================

  async function fetchChatById(chatId) {
    try {
      dispatch(setLoading(true));

      const data = await getChatById(chatId);

      dispatch(setMessages(data.messages));
      dispatch(setCurrentChatId(chatId));
          dispatch(setCurrentChatPdf(data.chat?.pdf || null)); // ye line add karo
           dispatch(setCurrentChatPdfName(data.chat?.pdf?.fileName || null));   // naya

    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }


  // =========================
// UPLOAD PDF
// =========================

async function handleUploadPdf(file) {
  try {
    dispatch(setPdfUploadStatus("uploading"));

    let chatIdToUse = currentChatId;

    // Agar abhi koi chat select nahi hai (fresh screen), pehle empty chat banao
    if (!chatIdToUse) {
      const chatData = await createEmptyChat();
      chatIdToUse = chatData.chat._id;

      dispatch(addNewChat(chatData.chat));
      dispatch(setCurrentChatId(chatIdToUse));
    }

    const data = await uploadPdf(chatIdToUse, file);

    dispatch(setCurrentChatPdf(data.pdf._id));
        dispatch(setCurrentChatPdfName(data.pdf.fileName));   // naya

    dispatch(setPdfUploadStatus("ready"));

    return true;
  } catch (err) {
    dispatch(setPdfUploadStatus("failed"));
    dispatch(setError(err.message));
    return false;
  }
}

  // =========================
  // SEND MESSAGE
  // =========================

  async function handleSendMessage(messageText) {
    try {
      dispatch(setLoading(true));

      // Clear previous queue
      chunkQueue.current = [];
      isProcessing.current = false;

      // Add user message
      dispatch(
        addMessage({
          role: "user",
          content: messageText,
        })
      );

      // Empty AI message
      dispatch(
        addMessage({
          role: "ai",
          content: "",
        })
      );

      await sendMessage({
        message: messageText,
        chatId: currentChatId,

        // New chat created
        onChat: (chat) => {
          if (!currentChatId) {
            dispatch(addNewChat(chat));
            dispatch(setCurrentChatId(chat._id));
          }
        },

        // AI streaming chunk
        onChunk: (chunk) => {
          /*
            Gemini ek bada chunk bhej sakta hai.

            Example:
            "Hello bhai kaise ho? Main AI hoon."

            Isko small pieces me tod rahe hain.
          */

          const pieces = chunk.match(/\S+\s*/g) || [];

          chunkQueue.current.push(...pieces);

          // Queue processing start
          processQueue();
        },

        // AI response complete
        onDone: (aiMessage) => {
          console.log("AI message saved:", aiMessage);
        },
      });

      return true;
    } catch (err) {
      dispatch(setError(err.message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }

  // =========================
  // DELETE CHAT
  // =========================

  async function handleDeleteChat(chatId) {
    try {
      await deleteChat(chatId);

      dispatch(removeChat(chatId));

      if (currentChatId === chatId) {
        dispatch(setCurrentChatId(null));
        dispatch(setMessages([]));
      }
    } catch (err) {
      dispatch(setError(err.message));
    }
  }

  // =========================
  // START NEW CHAT
  // =========================

  async function handleStartNewChat() {
    chunkQueue.current = [];
    isProcessing.current = false;

    dispatch(startNewChat());
  }

 return {
  chats,
  messages,
  currentChatId,
  currentChatPdf,
  pdfUploadStatus,
  loading,
  error,
  fetchChats,
  fetchChatById,
  handleUploadPdf,
  handleSendMessage,
  handleDeleteChat,
  handleStartNewChat,
  currentChatPdfName
};
}