import "dotenv/config";
import {
  StateGraph,
  StateSchema,
  type GraphNode,
  type StateType,
} from "@langchain/langgraph";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";

const llm = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
});

const State = new StateSchema({
  topic: z.string().describe("The topic of the conversation"),
  joke: z.string().describe("A joke related to the topic"),
  story: z.string().describe("A story related to the topic"),
  poem: z.string().describe("A poem related to the topic"),
  combinedOutput: z
    .string()
    .describe("The combined output of the joke, story, and poem"),
});

const generateJoke: GraphNode<typeof State> = async (state) => {
  const msg = await llm.invoke(`Write a short joke about ${state.topic}`);

  return {
    joke: String(msg.content),
  };
};

const generateStory: GraphNode<typeof State> = async (state) => {
  const msg = await llm.invoke(`Write a short story about ${state.topic}`);

  return {
    story: String(msg.content),
  };
};

const generatePoem: GraphNode<typeof State> = async (state) => {
  const msg = await llm.invoke(`Write a short poem about ${state.topic}`);

  return {
    poem: String(msg.content),
  };
};

const aggregrator: GraphNode<typeof State> = async (state) => {
  const combined =
    `Here's a story, joke, and poem about ${state.topic}!\n\n` +
    `STORY:\n${state.story}\n\n` +
    `JOKE:\n${state.joke}\n\n` +
    `POEM:\n${state.poem}`;
  return { combinedOutput: combined };
};

const graph = new StateGraph(State)
  .addNode("generateJoke", generateJoke)
  .addNode("generateStory", generateStory)
  .addNode("generatePoem", generatePoem)
  .addNode("aggregrator", aggregrator)
  .addEdge("__start__", "generateJoke")
  .addEdge("__start__", "generateStory")
  .addEdge("__start__", "generatePoem")
  .addEdge("generateJoke", "aggregrator")
  .addEdge("generateStory", "aggregrator")
  .addEdge("generatePoem", "aggregrator")
  .addEdge("aggregrator", "__end__")
  .compile();

const result = await graph.invoke({ topic: "cats" });
console.log(result.combinedOutput);
