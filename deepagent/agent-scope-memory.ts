import "dotenv/config";
import {
  createDeepAgent,
  CompositeBackend,
  StateBackend,
  StoreBackend,
  type FileData,
} from "deepagents";
import { InMemoryStore, MemorySaver } from "@langchain/langgraph";
import crypto from "crypto";
import { ChatGoogle } from "@langchain/google";
import { ChatOpenRouter } from "@langchain/openrouter";
const checkpointer = new MemorySaver(); // Required for state persistence across turns/threads

// const model = new ChatGoogle({
//   apiKey: process.env.GOOGLE_API_KEY!,
//   model: "gemini-2.5-flash",
// });

const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
});

const store = new InMemoryStore(); // Use platform store when deploying to LangSmith

function createFileData(content: string): FileData {
  const now = new Date().toISOString();
  return {
    content: content.split("\n"),
    created_at: now,
    modified_at: now,
  };
}

// Seed the memory file
await store.put(
  ["my-agent"],
  "/AGENTS.md",
  createFileData(`## Response style
- Keep responses concise
- Use code examples where possible
`),
);

// Seed a skill
await store.put(
  ["my-agent"],
  "/skills/langgraph-docs/SKILL.md",
  createFileData(`---
name: langgraph-docs
description: Fetch relevant LangGraph documentation to provide accurate guidance.
---

# langgraph-docs

Use the fetch_url tool to read https://docs.langchain.com/llms.txt, then fetch relevant pages.
`),
);
const agent = createDeepAgent({
  model: model,
  memory: ["/memories/AGENTS.md"],
  skills: ["/skills/"],
  backend: new CompositeBackend(new StateBackend(), {
    "/memories/": new StoreBackend({
      namespace: () => ["my-agent"],
    }),
    "/skills/": new StoreBackend({
      namespace: () => ["my-agent"],
    }),
  }),
  store: store,
  checkpointer: checkpointer,
});

const memory1 = await store.get(["my-agent"], "/AGENTS.md");
console.log("Initial memory content:", memory1);

// // Thread 1: the agent learns a new preference and saves it to memory
const config1 = { configurable: { thread_id: crypto.randomUUID() } };
const result1 = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "I prefer detailed explanations. Remember that.",
      },
    ],
  },
  config1,
);

console.log("Thread 1 result:", result1);
const memory2 = await store.get(["my-agent"], "/AGENTS.md");
console.log("Updated memory content:", memory2);

// Thread 2: the agent reads memory and applies the preference
const config2 = { configurable: { thread_id: crypto.randomUUID() } };
const result2 = await agent.invoke(
  {
    messages: [{ role: "user", content: "Explain how transformers work." }],
  },
  config2,
);

console.log("Thread 2 result:", result2);
const memory3 = await store.get(["my-agent"], "/AGENTS.md");
console.log("Final memory content:", memory3);
