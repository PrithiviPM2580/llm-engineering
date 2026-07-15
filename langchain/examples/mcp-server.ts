import "dotenv/config";
import { createAgent } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  temperature: 0.7,
});

const client = new MultiServerMCPClient({
  addTool: {
    transport: "stdio",
    command: "node",
    args: ["./src/server.ts"],
  },
  greet: {
    transport: "stdio",
    command: "node",
    args: ["./src/server.ts"],
  },
  currentDate: {
    transport: "stdio",
    command: "node",
    args: ["./src/server.ts"],
  },
  calculateBmi: {
    transport: "stdio",
    command: "node",
    args: ["./src/server.ts"],
  },
});

const tools = await client.getTools();

const agent = createAgent({
  model: model,
  name: "agent",
  tools,
});

const mathResponse = await agent.invoke({
  messages: [{ role: "user", content: "what's 3 + 5" }],
});

console.log("Math Response:", mathResponse);
