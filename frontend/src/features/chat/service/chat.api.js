import api from "../../../app/axiosInstance.js";

export async function sendMessage({ message, chatId }) {
  try {
    const response = await api.post("/api/chats/message", { message, chatId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
}

export async function getAllChats() {
  try {
    const response = await api.get("/api/chats");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
}

export async function getChatById(chatId) {
  try {
    const response = await api.get(`/api/chats/${chatId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
}

export async function deleteChat(chatId) {
  try {
    const response = await api.delete(`/api/chats/${chatId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
}
