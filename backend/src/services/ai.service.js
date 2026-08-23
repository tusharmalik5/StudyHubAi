import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { ChatMistralAI } from "@langchain/mistralai";

const Mistralmodel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_AI,
});

const Geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  apiKey: process.env.GOOGLE_GEMINI,
});

export async function generateResponse(messages) {
  const formattedMessages = messages.map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content),
  );
  const response = await Geminimodel.invoke(formattedMessages);
  return response.content;
}

export async function generateTitle(message) {
  const response = await Mistralmodel.invoke([
    new SystemMessage(
      "You are a title generator. Generate a very short title (max 5 words) summarizing the user's message. Do not use quotes, punctuation, or any extra explanation. Only output the title text.",
    ),
    new HumanMessage(message),
  ]);
  return response.content;
}
