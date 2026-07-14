import "dotenv/config";
import { RemoveMessage } from "@langchain/core/messages";
import { createAgent, createMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { ChatGoogle } from "@langchain/google";

const checkPointer = new MemorySaver();

const deleteOldMessage = createMiddleware({
  name: "DeleteOldMessage",
  afterModel: (state) => {
    const messages = state.messages;

    if (messages.length > 2) {
      return {
        messages: messages
          .slice(0, 2)
          .map((m) => new RemoveMessage({ id: m.id! })),
      };
    }
    return;
  },
});

const model = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
  temperature: 0.7,
});

const agent = createAgent({
  model: model,
  tools: [],
  systemPrompt: "Please be concise and to the point.",
  middleware: [deleteOldMessage],
  checkpointer: checkPointer,
});

const config = { configurable: { thread_id: "1" } };

const streamA = await agent.streamEvents(
  { messages: [{ role: "user", content: "hi! I'm bob" }] },
  { ...config, version: "v3" },
);
for await (const snapshot of streamA.values) {
  const messageDetails = snapshot.messages.map((message) => [
    message.type,
    message.content,
  ]);
  console.log(messageDetails);
}

const streamB = await agent.streamEvents(
  { messages: [{ role: "user", content: "write a short poem about cats" }] },
  { ...config, version: "v3" },
);
for await (const snapshot of streamB.values) {
  const messageDetails = snapshot.messages.map((message) => [
    message.type,
    message.content,
  ]);
  console.log(messageDetails);
}

const streamC = await agent.streamEvents(
  { messages: [{ role: "user", content: "what's my name?" }] },
  { ...config, version: "v3" },
);
for await (const snapshot of streamC.values) {
  const messageDetails = snapshot.messages.map((message) => [
    message.type,
    message.content,
  ]);
  console.log(messageDetails);
}
