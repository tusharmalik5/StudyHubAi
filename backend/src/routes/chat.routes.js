import express from "express";
import {
  sendMessage,
  getAllChats,
  getChatById,
  deleteChat,
  uploadPdfController, 
  createEmptyChat
} from "../controllers/chat.controller.js";
import { authUser } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";


const chatRouter = express.Router();

chatRouter.post("/message", authUser, sendMessage);

chatRouter.get("/:chatId", authUser, getChatById);
chatRouter.get("/", authUser, getAllChats);
chatRouter.delete("/:chatId", authUser, deleteChat);
chatRouter.post("/create", authUser, createEmptyChat);
chatRouter.post("/:chatId/upload-pdf", authUser, upload.single("pdf"), uploadPdfController);


export default chatRouter;
