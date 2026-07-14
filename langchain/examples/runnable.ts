import "dotenv/config";
import {
  RunnableAssign,
  RunnableBranch,
  RunnableLambda,
  RunnableParallel,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatGoogle } from "@langchain/google";

const model = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
  temperature: 0.7,
});

const cleanQuestion = new RunnableLambda({
  func: (input: string) => input.trim(),
});

const codingRetriver = RunnableLambda.from((question: string) => {
  return ["TypeScript Runnable docs", "LCEL examples"];
});

const docsRetriever = RunnableLambda.from((question: string) => {
  return ["LangChain overview", "Introduction guide"];
});

const retriver = RunnableBranch.from([
  [
    (question: string) => question.toLocaleLowerCase().includes("code"),
    codingRetriver,
  ],
  docsRetriever,
]);

const detectLanguage = RunnableLambda.from((question: string) => {
  if (question.includes("¿")) {
    return "Spanish";
  }
  return "English";
});

const prepareInput = RunnableParallel.from({
  question: new RunnablePassthrough(),
  docs: retriver,
  language: detectLanguage,
});

const addMetadata = RunnablePassthrough.assign({
  docCount: (input: { docs: string[] }) => input.docs.length,
});

const prompt = ChatPromptTemplate.fromTemplate(`
You are an AI assistant.

Language:
{language}

Retrieved Documents:
{docs}

Number of Docs:
{docCount}

Question:
{question}
`);

const parser = new StringOutputParser();

const chain = cleanQuestion
  .pipe(prepareInput)
  .pipe(addMetadata)
  .pipe(prompt)
  .pipe(model)
  .pipe(parser);

const result = await chain.invoke(
  "   Explain RunnableParallel in LangChain   ",
);

console.log(result);
