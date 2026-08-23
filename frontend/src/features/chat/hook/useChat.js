import { useDispatch, useSelector } from "react-redux";
import {
  getAllChats,
  getChatById,
  sendMessage,
  deleteChat,
} from "../service/chat.api.js";
import {
  setChats,
  setMessages,
  addMessage,
  setCurrentChatId,
  addNewChat,
  removeChat,
  setLoading,
  setError,
  startNewChat,
} from "../chat.slice.js";

export function useChat() {
  const dispatch = useDispatch();
  const { chats, messages, currentChatId, loading, error } = useSelector(
    (state) => state.chat,
  );

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

  async function fetchChatById(chatId) {
    try {
      dispatch(setLoading(true));
      const data = await getChatById(chatId);
      dispatch(setMessages(data.messages));
      dispatch(setCurrentChatId(chatId));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleSendMessage(messageText) {
    try {
      dispatch(setLoading(true));

      dispatch(addMessage({ role: "user", content: messageText }));

      const data = await sendMessage({
        message: messageText,
        chatId: currentChatId,
      });

      if (!currentChatId) {
        dispatch(addNewChat(data.chat));
        dispatch(setCurrentChatId(data.chat._id));
      }

      dispatch(addMessage(data.aiMessage));

      return true;
    } catch (err) {
      dispatch(setError(err.message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }

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

  async function handleStartNewChat() {
    dispatch(startNewChat());
  }

  return {
    chats,
    messages,
    currentChatId,
    loading,
    error,
    fetchChats,
    fetchChatById,
    handleSendMessage,
    handleDeleteChat,
    handleStartNewChat,
  };
}
