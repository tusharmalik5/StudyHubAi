import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    currentChatId: null,
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    addNewChat: (state, action) => {
      state.chats.unshift(action.payload);
    },
    removeChat: (state, action) => {
      state.chats = state.chats.filter((chat) => chat._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    startNewChat: (state) => {
      state.messages = [];
      state.currentChatId = null;
    },
  },
});

export const {
  setChats,
  setMessages,
  addMessage,
  setCurrentChatId,
  addNewChat,
  removeChat,
  setLoading,
  setError,
  startNewChat,
} = chatSlice.actions;

export default chatSlice.reducer;
