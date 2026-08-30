import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function extractTextFromPdf(fileBuffer) {
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    return result.text;
}

export async function chunkText(text) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 150
    });
    const chunks = await splitter.splitText(text);
    return chunks;
}