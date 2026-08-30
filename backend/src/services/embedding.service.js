import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "models/gemini-embedding-001",
  apiKey: process.env.GOOGLE_GEMINI,
});

export async function generateEmbedding(text) {
  const result = await embeddings.embedQuery(text);
  return result;
}