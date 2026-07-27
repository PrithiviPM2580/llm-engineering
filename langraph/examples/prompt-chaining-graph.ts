import "dotenv/config";
import {
  StateGraph,
  StateSchema,
  type ConditionalEdgeRouter,
  type GraphNode,
} from "@langchain/langgraph";
import { z } from "zod";
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
});

const State = new StateSchema({
  topic: z.string().describe("The topic of the conversation"),
  joke: z.string().describe("A joke related to the topic"),
  improvedJoke: z.string().describe("An improved version of the joke"),
  finalJoke: z.string().describe("The final version of the joke"),
});

const generateJoke: GraphNode<typeof State> = async (state) => {
  const msg = await llm.invoke(`Write a short joke about ${state.topic}`);

  return {
    joke: msg.text,
  };
};

const checkPunchline: ConditionalEdgeRouter<
  typeof State,
  Record<string, any>,
  "Pass" | "Fail"
> = async (state) => {
  if (state.joke?.includes("?") || state.joke?.includes("!")) {
    return "Pass";
  }
  return "Fail";
};

const improveJoke: GraphNode<typeof State> = async (state) => {
  const msg = await llm.invoke(`Improve the following joke: ${state.joke}`);
  return {
    improvedJoke: msg.text,
  };
};

const polishJoke: GraphNode<typeof State> = async (state) => {
  const msg = await llm.invoke(
    `Polish the following joke: ${state.improvedJoke}`,
  );
  return {
    finalJoke: msg.text,
  };
};

const chain = new StateGraph(State)
  .addNode("generateJoke", generateJoke)
  .addNode("improveJoke", improveJoke)
  .addNode("polishJoke", polishJoke)
  .addEdge("__start__", "generateJoke")
  .addConditionalEdges("generateJoke", checkPunchline, {
    Pass: "improveJoke",
    Fail: "__end__",
  })
  .addEdge("improveJoke", "polishJoke")
  .addEdge("polishJoke", "__end__")
  .compile();

const state = await chain.invoke({ topic: "cats" });
console.log("Initial joke:");
console.log(state.joke);
console.log("\n--- --- ---\n");
if (state.improvedJoke !== undefined) {
  console.log("Improved joke:");
  console.log(state.improvedJoke);
  console.log("\n--- --- ---\n");

  console.log("Final joke:");
  console.log(state.finalJoke);
} else {
  console.log("Joke failed quality gate - no punchline detected!");
}
