import { ChatGoogle } from "@langchain/google";
import {
  StateGraph,
  StateSchema,
  type ConditionalEdgeRouter,
  type GraphNode,
} from "@langchain/langgraph";
import "dotenv/config";

import { z } from "zod";

const routeSchema = z.object({
  step: z
    .enum(["joke", "poem", "story"])
    .describe("The type of content to generate"),
});

const llm = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
});

const router = llm.withStructuredOutput(routeSchema);

const State = new StateSchema({
  input: z.string().describe("The input topic for the content generation"),
  decision: z.string().describe("The decision made by the router"),
  output: z.string().describe("The generated content based on the decision"),
});

const generateJoke: GraphNode<typeof State> = async (state) => {
  const msg = await llm.invoke([
    {
      role: "system",
      content: "You are a joke generator. Dont make it too long.",
    },
    { role: "user", content: `Write a short joke about ${state.input}` },
  ]);

  return {
    output: String(msg.content),
  };
};

const generatePoem: GraphNode<typeof State> = async (state) => {
  const msg = await llm.invoke([
    {
      role: "system",
      content: "You are a poem generator. Dont make it too long.",
    },
    { role: "user", content: `Write a short poem about ${state.input}` },
  ]);

  return {
    output: String(msg.content),
  };
};

const generateStory: GraphNode<typeof State> = async (state) => {
  const msg = await llm.invoke([
    {
      role: "system",
      content: "You are a story generator. Dont make it too long.",
    },
    { role: "user", content: `Write a short story about ${state.input}` },
  ]);

  return {
    output: String(msg.content),
  };
};

const routing: GraphNode<typeof State> = async (state) => {
  const msg = await router.invoke([
    {
      role: "system",
      content:
        "You are a router that decides whether to generate a joke, poem, or story based on the input topic.",
    },
    {
      role: "human",
      content: state.input,
    },
  ]);

  return {
    decision: msg.step,
  };
};

const routerDecision: ConditionalEdgeRouter<
  typeof State,
  Record<string, any>,
  "joke" | "poem" | "story"
> = async (state) => {
  if (state.decision === "joke") {
    return "joke";
  } else if (state.decision === "poem") {
    return "poem";
  } else {
    return "story";
  }
};

const routerWorkflow = new StateGraph(State)
  .addNode("routing", routing)
  .addNode("generateJoke", generateJoke)
  .addNode("generatePoem", generatePoem)
  .addNode("generateStory", generateStory)
  .addEdge("__start__", "routing")
  .addConditionalEdges("routing", routerDecision, {
    joke: "generateJoke",
    poem: "generatePoem",
    story: "generateStory",
  })
  .addEdge("generateJoke", "__end__")
  .addEdge("generatePoem", "__end__")
  .addEdge("generateStory", "__end__")
  .compile();

const state = await routerWorkflow.invoke({
  input: "Write me a joke about cats",
});
console.log(`Decision: ${state.decision}`);
console.log(`Output: ${state.output}`);
