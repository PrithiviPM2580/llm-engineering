import "dotenv/config";
import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { createAgent, tool, type ToolRuntime } from "langchain";
import { Command, MemorySaver, StateSchema } from "@langchain/langgraph";
import { ChatGoogle } from "@langchain/google";

import * as z from "zod";

const CustomState = new StateSchema({
  userId: z.string().optional(),
  userName: z.string().optional(),
});

const updateInfo = tool(
  async (_, config: ToolRuntime<typeof CustomState.State>) => {
    const userId = config.state.userId;
    const name = userId === "user_123" ? "John Doe" : "Unknown User";
    return new Command({
      update: {
        userName: name,
        messages: [
          new ToolMessage({
            content: "Successfully updated user information.",
            tool_call_id: config.toolCall?.id ?? "",
          }),
        ],
      },
    });
  },
  {
    name: "update_user_info",
    description: "Update user information in the state",
    schema: z.object({}),
  },
);

const greet = tool(
  async (_, config: ToolRuntime<typeof CustomState.State>) => {
    const userName = config.state.userName;
    return `Hello ${userName}`;
  },
  {
    name: "greet_user",
    description: "Greet the user based on the state information",
    schema: z.object({}),
  },
);

const model = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
  temperature: 0.7,
});

const agent = createAgent({
  model: model,
  tools: [updateInfo, greet],
  stateSchema: CustomState,
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "look up my info and greet me" }],
  userId: "user_123",
});

console.log(result.messages.at(-1)?.content); // Should print "Hello John Doe"
