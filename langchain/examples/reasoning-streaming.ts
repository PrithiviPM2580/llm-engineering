import "dotenv/config";
import { createAgent, tool } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { type LangGraphRunnableConfig } from "@langchain/langgraph";
import * as z from "zod";

const getWeather = tool(
  async ({ city }) => {
    return `It's always sunny in ${city}!`;
  },
  {
    name: "get_weather",
    description: "Get weather for a given city.",
    schema: z.object({ city: z.string() }),
  },
);
const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  temperature: 0.7,
});

const agent = createAgent({
  model: model,
  name: "agent",
  tools: [getWeather],
});

try {
  const stream = await agent.streamEvents(
    { messages: [{ role: "user", content: "What is the weather in SF?" }] },
    { version: "v3" },
  );
  for await (const message of stream.messages) {
    for await (const token of message.reasoning) {
      process.stdout.write(`[thinking] ${token}`);
    }
    for await (const token of message.text) {
      process.stdout.write(token);
    }
  }
} catch (error) {
  console.error("Error occurred:", error);
}
