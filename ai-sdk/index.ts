import "dotenv/config";
import {
  type TypedToolCall,
  type TypedToolResult,
  generateText,
  isStepCount,
  tool,
} from "ai";
import { z } from "zod";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_AI_API_KEY!,
});

const myToolSet = {
  firstTool: tool({
    description: "Greets the user",
    inputSchema: z.object({ name: z.string() }),
    execute: async ({ name }) => `Hello, ${name}!`,
  }),
  secondTool: tool({
    description: "Tells the user their age",
    inputSchema: z.object({ age: z.number() }),
    execute: async ({ age }) => `You are ${age} years old!`,
  }),
};

type MyToolCall = TypedToolCall<typeof myToolSet>;
type MyToolResult = TypedToolResult<typeof myToolSet>;

async function generateSomething(prompt: string): Promise<{
  text: string;
  toolCalls: Array<MyToolCall>; // typed tool calls
  toolResults: Array<MyToolResult>; // typed tool results
}> {
  return generateText({
    model: openrouter.chat("nvidia/nemotron-3-ultra-550b-a55b:free"),
    tools: myToolSet,
    prompt,
    stopWhen: isStepCount(5),
  });
}

const { text, toolCalls, toolResults } = await generateSomething(
  "My name is Alice and I am 30 years old. Please greet me and tell me my age.",
);
console.log("Generated Text:", text);
console.log("Tool Calls:", toolCalls);
console.log("Tool Results:", toolResults);
