import "dotenv/config";
import { createAgent, tool, type ToolRuntime } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { InMemoryStore } from "@langchain/langgraph";
import { z } from "zod";

const store = new InMemoryStore();

const contextSchema = z.object({
  userId: z.string().describe("The unique identifier for the user"),
});

const userInfoSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  temperature: 0.7,
});

await store.put(["users"], "user123", {
  name: "John Doe",
  age: 30,
  email: "john.doe@example.com",
});

const getUserInfo = tool(
  async (_, runtime: ToolRuntime<unknown, typeof contextSchema>) => {
    const userId = runtime.context.userId;

    if (!userId) throw new Error("userId is required in the context");

    const userInfo = await store.get(["users"], userId);
    return userInfo?.value ? JSON.stringify(userInfo?.value) : "Unknown user";
  },
  {
    name: "get-user-info",
    description:
      "Fetch the current user's information. The userId is already available from the agent context, so call this tool whenever the user asks for user information.",
    schema: z.object({}),
  },
);

const agent = createAgent({
  model,
  tools: [getUserInfo],
  contextSchema,
  store,
  responseFormat: userInfoSchema,
  systemPrompt:
    "You are a helpful assistant. When the user asks for user information, always use the get-user-info tool. The userId is provided in the context.",
});

const result = await agent.invoke(
  { messages: [{ role: "user", content: "look up user information" }] },
  { context: { userId: "user123" } },
);

console.log(result.structuredResponse);
