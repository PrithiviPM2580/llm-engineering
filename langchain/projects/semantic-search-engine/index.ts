import "dotenv/config";
import { ChatOpenRouter } from "@langchain/openrouter";
import { PDFParse } from "pdf-parse";
import { readFileSync } from "node:fs";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { VectorStore } from "@langchain/core/vectorstores";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import {} from "@langchain/google";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-embedding-2",
});

const llm = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
});

async function loadPDFParse(filePath: string): Promise<Document[]> {
  const parser = new PDFParse({
    data: new Uint8Array(readFileSync(filePath)),
  });

  try {
    const { pages } = await parser.getText();
    return pages.map(
      (page) =>
        new Document({
          pageContent: page.text,
          metadata: {
            source: filePath,
            page: page.num - 1,
            name: "prithivi resume",
          },
        }),
    );
  } finally {
    await parser.destroy();
  }
}

const docs = await loadPDFParse("./public/resume.pdf");

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 30,
});

const allSplits = await textSplitter.splitDocuments(docs);

const vectorStore = new MemoryVectorStore(embeddings);

await vectorStore.addDocuments(allSplits);
const retriever = vectorStore.asRetriever({
  searchType: "mmr",
  searchKwargs: {
    fetchK: 2,
  },
});

const result = await retriever.batch([
  "Whats the name of the pdf owner?",
  "List the skills of the pdf owner?",
]);

console.log(result);
