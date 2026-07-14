import "dotenv/config";
import { createAgent, tool } from "langchain";
import { ChatGoogle } from "@langchain/google";
import * as z from "zod";

const model = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
  temperature: 0.7,
});

const getWeather = tool(async ({ city }) => `It's always sunny in ${city}!`, {
  name: "get_weather",
  description: "Get weather for a city.",
  schema: z.object({ city: z.string() }),
});

const agent = createAgent({
  model: model,
  tools: [getWeather],
});

const stream = await agent.streamEvents(
  { messages: [{ role: "user", content: "What is the weather in SF?" }] },
  { version: "v3" },
);

for await (const message of stream.messages) {
  for await (const delta of message.text) {
    process.stdout.write(delta);
  }
}

const finalState = await stream.output;
