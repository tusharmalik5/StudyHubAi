import { generateResponse, generateTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateImage } from "../services/ai.service.js";
import pdfModel from "../models/pdf.model.js";
import { extractTextFromPdf, chunkText } from "../services/pdfProcessing.service.js";
import { upsertChunks } from "../services/vector.service.js";


function isImageRequest(message) {
  const actionWords = /generate|create|draw|make|design/i;
  const imageWords = /image|picture|photo|drawing|illustration/i;
  return actionWords.test(message) && imageWords.test(message);
}

export async function sendMessage(req, res) {
  try {
    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
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
        return res.status(404).json({
          message: "Chat not found",
        });
      }
    }

    await messageModel.create({
      chat: chat._id,
      content: message,
      role: "user",
    });

    const wantsImage = isImageRequest(message);

    if (wantsImage) {
      const imageDataUrl = await generateImage(message);

      const aiMessage = await messageModel.create({
        chat: chat._id,
        content: "Here is your generated image.",
        role: "ai",
        imageUrl: imageDataUrl,
      });

      return res.status(201).json({
        chat,
        aiMessage,
      });
    }

    // Streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // IMPORTANT:
    // frontend ko chat ki information pehle bhejo
    res.write(
      `event: chat\ndata: ${JSON.stringify({
        chat,
      })}\n\n`
    );

    const allMessages = await messageModel
      .find({ chat: chat._id })
      .sort({ createdAt: 1 });

    const stream = generateResponse(allMessages, chat._id, !!chat.pdf);

    let fullResponse = "";

    for await (const chunk of stream) {
      fullResponse += chunk;

      res.write(
        `event: chunk\ndata: ${JSON.stringify({
          content: chunk,
        })}\n\n`
      );
    }

    const aiMessage = await messageModel.create({
      chat: chat._id,
      content: fullResponse,
      role: "ai",
    });

    // Tell frontend streaming is complete
    res.write(
      `event: done\ndata: ${JSON.stringify({
        aiMessage,
      })}\n\n`
    );

    res.end();
  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Something went wrong",
      });
    }

    res.end();
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



export async function uploadPdfController(req, res) {
    try {
        const { chatId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No PDF file uploaded" });
        }

        const pdfDoc = await pdfModel.create({
            chat: chatId,
            fileName: file.originalname,
            status: "processing"
        });

        await chatModel.findByIdAndUpdate(chatId, { pdf: pdfDoc._id });

        const text = await extractTextFromPdf(file.buffer);
        console.log("Extracted text length:", text.length);
console.log("Extracted text preview:", text.slice(0, 200));
        const chunks = await chunkText(text);
console.log("Number of chunks:", chunks.length);
        await upsertChunks(chunks, chatId, pdfDoc._id);

        pdfDoc.status = "ready";
        pdfDoc.totalChunks = chunks.length;
        await pdfDoc.save();

        res.status(200).json({ message: "PDF processed successfully", pdf: pdfDoc });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "PDF processing failed", error: error.message });
    }
}


export async function createEmptyChat(req, res) {
  try {
    const chat = await chatModel.create({
      user: req.user.userId,
      title: "New Chat",
    });

    return res.status(201).json({ chat });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}