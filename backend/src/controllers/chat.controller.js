import { generateResponse, generateTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {
  try {
    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    let chat;

    if (!chatId) {
      const title = await generateTitle(message);
      chat = await chatModel.create({
        user: req.user.id,
        title,
      });
    } else {
      chat = await chatModel.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
    }

    const userMessage = await messageModel.create({
      chat: chat._id,
      content: message,
      role: "user",
    });

    const allMessages = await messageModel.findById({ chat: chat._id });

    const result = await generateResponse(allMessages);

    const aiMessage = await messageModel.create({
      chat: chat._id,
      content: result,
      role: "ai",
    });

    return res.status(201).json({
      chat,
      aiMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// 1. Saare chats ki list (sidebar ke liye)
export async function getAllChats(req, res) {
  try {
    const chats = await chatModel
      .find({ user: req.user.id })
      .select("title createdAt")
      .sort({ createdAt: -1 }); // sabse naya chat sabse upar

    return res.status(200).json({ chats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// 2. Ek specific chat ke saare messages
export async function getChatById(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // security check - sirf apni khud ki chat access kar sake
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 }); // purane se naye order me

    return res.status(200).json({ chat, messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// 3. Chat delete karna
export async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // security check - sirf apni khud ki chat delete kar sake
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await chatModel.findByIdAndDelete(chatId);
    await messageModel.deleteMany({ chat: chatId }); // us chat ke saare messages bhi delete karo

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
