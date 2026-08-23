import express from "express";
import {
  sendMessage,
  getAllChats,
  getChatById,
  deleteChat,
} from "../controllers/chat.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.post("/message", authUser, sendMessage);

chatRouter.get("/:chatId", authUser, getChatById);
chatRouter.get("/", authUser, getAllChats);
chatRouter.delete("/:chatId", authUser, deleteChat);

export default chatRouter;
