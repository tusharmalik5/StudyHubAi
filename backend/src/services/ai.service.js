import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Modality } from "@google/genai"; 
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { TavilySearch } from "@langchain/tavily";
import { createAgent, tool } from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";
import * as z from "zod";

const Mistralmodel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_AI,
});

const Imagemodel = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-image", 
  apiKey: process.env.GOOGLE_GEMINI,
  responseModalities: [Modality.IMAGE], 
});

const Geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  apiKey: process.env.GOOGLE_GEMINI,
});

const searchTool = new TavilySearch({
  maxResults: 3,
  tavilyApiKey: process.env.TAVILY_API_KEY,
});

function extractImageBase64(response) {
  const imageBlock = response.content.find(
    (block) =>
      typeof block === "object" &&
      block !== null &&
      "image_url" in block
  );

  if (!imageBlock) return null;

  return imageBlock.image_url.url.split(",")[1]; 
}

export async function generateImage(prompt) {
  const response = await Imagemodel.invoke(prompt);
  const imageBase64 = extractImageBase64(response);

  if (!imageBase64) {
    throw new Error("Image generation failed");
  }

  return `data:image/png;base64,${imageBase64}`; 
}

const imageGenTool = tool(
  async ({ prompt }) => {
    try {
      const imageDataUrl = await generateImage(prompt);
      return imageDataUrl;
    } catch (error) {
      return "Image generation failed";
    }
  },
  {
    name: "generate_image",
    description:
      "Generate an image based on a text description. Use this whenever the user asks to create, draw, generate, or make an image or picture.",
    schema: z.object({
      prompt: z.string().describe("Description of the image to generate"),
    }),
  }
);

const agent = createAgent({
  model: Geminimodel,
  tools: [searchTool, imageGenTool],
});

export async function generateResponse(messages) {
  const formattedMessages = messages.map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );
  const result = await agent.invoke({
    messages: formattedMessages,
  });

  const lastMessage = result.messages[result.messages.length - 1];
  return lastMessage.content;
}

export async function generateTitle(message) {
  const response = await Mistralmodel.invoke([
    new SystemMessage(
      "You are a title generator. Generate a very short title (max 5 words) summarizing the user's message. Do not use quotes, punctuation, or any extra explanation. Only output the title text."
    ),
    new HumanMessage(message),
  ]);
  return response.content;
}