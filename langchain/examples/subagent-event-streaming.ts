import { createAgent, tool } from "langchain";
import { z } from "zod";

const getWeather = tool(async ({ city }) => `It's always sunny in ${city}!`, {
  name: "get_weather",
  schema: z.object({ city: z.string() }),
});

const weatherAgent = createAgent({
  model: "openai:gpt-5.5",
  tools: [getWeather],
  name: "weather_agent",
});

const callWeather = tool(
  async ({ query }) => {
    const result = await weatherAgent.invoke({
      messages: [{ role: "user", content: query }],
    });
    return result.messages.at(-1)?.text ?? "";
  },
  { name: "call_weather", schema: z.object({ query: z.string() }) },
);

const supervisor = createAgent({
  model: "openai:gpt-5.5",
  tools: [callWeather],
  name: "supervisor",
});

const stream = await supervisor.streamEvents(
  { messages: [{ role: "user", content: "What's the weather in Boston?" }] },
  { version: "v3" },
);

for await (const subagent of stream.subgraphs) {
  if (subagent.name !== "weather_agent") continue;
  process.stdout.write(`${subagent.name}: `);
  for await (const message of subagent.messages) {
    for await (const token of message.text) {
      process.stdout.write(token);
    }
  }
  process.stdout.write("\n");
}
