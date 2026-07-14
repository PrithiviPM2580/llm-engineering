import "dotenv/config";
import { AIMessage, createAgent, createMiddleware } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { MemorySaver } from "@langchain/langgraph";
import * as z from "zod";

const checkpointer = new MemorySaver();

const createMessageLimitMiddleware = (maxMessage: number = 3) => {
  return createMiddleware({
    name: "message-limit-middleware",
    beforeModel: {
      canJumpTo: ["end"],
      hook: (state) => {
        if (state.messages.length > maxMessage) {
          return {
            messages: [new AIMessage("Conversation limit reacher")],
            jumpTo: "end",
          };
        }
        return;
      },
    },
    afterModel: (state) => {
      const lastMessage = state.messages.at(-1);
      console.log(`Model returned: ${lastMessage?.content}`);
      return;
    },
  });
};

const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  temperature: 0.7,
});

const agent = createAgent({
  model: model,
  name: "agent",
  tools: [],
  middleware: [createMessageLimitMiddleware(3)],
  checkpointer,
});

const configurable = {
  configurable: {
    thread_id: "thread-1",
  },
};

let result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "Hi",
      },
    ],
  },
  configurable,
);

console.log(result.messages.at(-1)?.content);

result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "How are you?",
      },
    ],
  },
  configurable,
);

console.log(result.messages.at(-1)?.content);

result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "Tell me a joke.",
      },
    ],
  },
  configurable,
);

console.log(result.messages.at(-1)?.content);

result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "What is AI?",
      },
    ],
  },
  configurable,
);

console.log(result.messages.at(-1)?.content);
