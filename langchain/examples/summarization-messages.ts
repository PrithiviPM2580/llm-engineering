import "dotenv/config";
import { createAgent, summarizationMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { ChatGoogle } from "@langchain/google";

const checkPointer = new MemorySaver();

const model = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
  temperature: 0.7,
});

const agent = createAgent({
  model: model,
  tools: [],
  middleware: [
    summarizationMiddleware({
      model: model,
      trigger: { tokens: 4000 },
      keep: { messages: 20 },
    }),
  ],
  checkpointer: checkPointer,
});

const config = { configurable: { thread_id: "1" } };
await agent.invoke({ messages: "hi, my name is bob" }, config);
await agent.invoke({ messages: "write a short poem about cats" }, config);
await agent.invoke({ messages: "now do the same but for dogs" }, config);
const finalResponse = await agent.invoke(
  { messages: "what's my name?" },
  config,
);

console.log(finalResponse.messages.at(-1)?.content);
