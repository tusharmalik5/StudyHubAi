import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { TavilySearch } from "@langchain/tavily";
import { createAgent } from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";
import { queryRelevantChunks } from "./vector.service.js";

const Mistralmodel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_AI,
});

const Geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  apiKey: process.env.GOOGLE_GEMINI,
});

const searchTool = new TavilySearch({
  maxResults: 3,
  tavilyApiKey: process.env.TAVILY_API_KEY,
});

export async function generateImage(prompt) {
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true`;
  return imageUrl;
}

const agent = createAgent({
  model: Geminimodel,
  tools: [searchTool],
});

export async function* generateResponse(messages, chatId, hasPdf = false) {
  const formattedMessages = messages.map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );

  // --- RAG branch: agent bypass, direct model stream ---
  if (hasPdf) {
    const lastUserMessage = messages[messages.length - 1].content;
    const relevantChunks = await queryRelevantChunks(lastUserMessage, chatId);
    const context = relevantChunks.join("\n\n---\n\n");

    const ragPrompt = `Answer the question based only on the following context extracted from the uploaded PDF. If the answer isn't present in the context, say you don't have that information.\n\nContext:\n${context}\n\nQuestion: ${lastUserMessage}`;

    const stream = await Geminimodel.stream([new HumanMessage(ragPrompt)]);

    for await (const chunk of stream) {
      const content = chunk.content;
      if (typeof content === "string" && content) {
        yield content;
      }
    }
    return; // RAG branch khatam, agent wala code neeche skip ho jayega
  }

  // --- Normal branch: existing agent + Tavily flow ---
  const stream = await agent.stream(
    { messages: formattedMessages },
    { streamMode: "messages" }
  );

  for await (const [messageChunk, metadata] of stream) {
    const content = messageChunk.content;
    if (typeof content === "string" && content) {
      yield content;
    }
  }
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