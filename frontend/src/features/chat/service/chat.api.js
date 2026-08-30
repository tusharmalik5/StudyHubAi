import api from "../../../app/axiosInstance.js";

export async function sendMessage({ message, chatId, onChat, onChunk, onDone }) {
  const response = await fetch("http://localhost:3000/api/chats/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      message,
      chatId,
    }),
  });

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, {
      stream: true,
    });

    const events = buffer.split("\n\n");

    buffer = events.pop();

    for (const event of events) {
      const lines = event.split("\n");

      const eventName = lines
        .find((line) => line.startsWith("event:"))
        ?.replace("event:", "")
        .trim();

      const dataLine = lines.find((line) =>
        line.startsWith("data:")
      );

      if (!dataLine) continue;

      const data = JSON.parse(
        dataLine.replace("data:", "").trim()
      );

      if (eventName === "chat") {
        onChat(data.chat);
      }

      if (eventName === "chunk") {
        onChunk(data.content);
      }

      if (eventName === "done") {
        onDone(data.aiMessage);
      }
    }
  }
}

export async function createEmptyChat() {
  try {
    const response = await api.post("/api/chats/create");
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


export async function uploadPdf(chatId, file) {
  try {
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await api.post(
      `/api/chats/${chatId}/upload-pdf`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
}
