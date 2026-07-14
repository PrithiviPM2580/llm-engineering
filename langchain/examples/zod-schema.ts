import "dotenv/config";
import { createAgent, tool, providerStrategy } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import * as z from "zod";

const ContactInfo = z.object({
  name: z.string().describe("The name of the person"),
  email: z.string().describe("The email address of the person"),
  phone: z.string().describe("The phone number of the person"),
});

const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  temperature: 0.7,
});

const agent = createAgent({
  model: model,
  name: "agent",
  tools: [],
  responseFormat: providerStrategy(ContactInfo),
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "Extract contact info from: John Doe, john@example.com, (555) 123-4567",
    },
  ],
});

console.log(result.structuredResponse);
