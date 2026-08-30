import pineconeIndex from "../config/pinecone.js"; 
import { generateEmbedding } from "./embedding.service.js";

export async function upsertChunks(chunks, chatId, pdfId) {
    const vectors = [];

    for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbedding(chunks[i]);

        vectors.push({
            id: `${pdfId}-chunk-${i}`,
            values: Array.from(embedding),  // yahan fix kiya
            metadata: {
                chatId: chatId.toString(),
                pdfId: pdfId.toString(),
                text: chunks[i]
            }
        });
    }

    await pineconeIndex.upsert(vectors);
}
export async function queryRelevantChunks(question, chatId, topK = 4) {
    const questionEmbedding = await generateEmbedding(question);

    const result = await pineconeIndex.query({
        vector: questionEmbedding,
        topK,
        filter: { chatId: chatId.toString() },
        includeMetadata: true
    });

    return result.matches.map(match => match.metadata.text);
}