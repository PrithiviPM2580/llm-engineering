import "dotenv/config";
import { createAgent, tool } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { MemorySaver } from "@langchain/langgraph";
import * as z from "zod";

const checkpointer = new MemorySaver();

const getWeather = tool(async ({ city }) => `It's always sunny in ${city}!`, {
  name: "get_weather",
  description: "Get weather for a city.",
  schema: z.object({ city: z.string() }),
});

const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  temperature: 0.7,
});

const agent = createAgent({
  model: model,
  name: "agent",
  tools: [getWeather],
  checkpointer,
});

const config = { configurable: { thread_id: crypto.randomUUID() } };

const stream = await agent.streamEvents(
  { messages: [{ role: "user", content: "what is the weather in sf" }] },
  { ...config, version: "v3" },
);
await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      for await (const token of message.text) {
        process.stdout.write(token);
      }
    }
  })(),
  (async () => {
    for await (const call of stream.toolCalls) {
      console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
      console.log(`Tool result: ${await call.output}`);
    }
  })(),
]);

const finalState = await stream.output;
console.log("FinalState: ", finalState);
