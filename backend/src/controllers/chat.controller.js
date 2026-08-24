import { generateResponse, generateTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateImage } from "../services/ai.service.js";

function isImageRequest(message) {
  const actionWords = /generate|create|draw|make|design/i;
  const imageWords = /image|picture|photo|drawing|illustration/i;
  return actionWords.test(message) && imageWords.test(message);
}

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
        user: req.user.userId,
        title,
      });
    } else {
      chat = await chatModel.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
    }

    await messageModel.create({
      chat: chat._id,
      content: message,
      role: "user",
    });

    const wantsImage = isImageRequest(message);
    let aiMessage;

    if (wantsImage) {
      const imageDataUrl = await generateImage(message);

      aiMessage = await messageModel.create({
        chat: chat._id,
        content: "Here is your generated image.",
        role: "ai",
        imageUrl: imageDataUrl, 
      });
    } else {
      const allMessages = await messageModel
        .find({ chat: chat._id })
        .sort({ createdAt: 1 });

      const result = await generateResponse(allMessages);

      aiMessage = await messageModel.create({
        chat: chat._id,
        content: result,
        role: "ai",
      });
    }

    return res.status(201).json({
      chat,
      aiMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}


export async function getAllChats(req, res) {
  try {
    const chats = await chatModel
      .find({ user: req.user.userId })
      .select("title createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ chats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

export async function getChatById(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });

    return res.status(200).json({ chat, messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

export async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await chatModel.findByIdAndDelete(chatId);
    await messageModel.deleteMany({ chat: chatId });

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
