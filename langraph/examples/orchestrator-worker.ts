import "dotenv/config";
import { ChatGoogle } from "@langchain/google";
import { z } from "zod";
import {
  ReducedValue,
  Send,
  StateGraph,
  StateSchema,
  type ConditionalEdgeRouter,
  type GraphNode,
} from "@langchain/langgraph";
import { ChatOpenRouter } from "@langchain/openrouter";

const sectionSchema = z.object({
  name: z.string(),
  description: z.string(),
});

type SectionSchema = z.infer<typeof sectionSchema>;

// const llm = new ChatGoogle({
//   apiKey: process.env.GOOGLE_API_KEY!,
//   model: "gemini-2.5-flash",
// });

const llm = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
});

const planner = llm.withStructuredOutput(
  z.object({
    sections: z.array(sectionSchema),
  }),
);

// --------------------
// Main graph state
// --------------------

const State = new StateSchema({
  topic: z.string(),

  sections: z.array(z.custom<SectionSchema>()),

  completedSections: new ReducedValue(
    z.array(z.string()).default(() => []),
    {
      reducer: (a, b) => a.concat(b),
    },
  ),

  finalReport: z.string(),
});

// --------------------
// Worker node
// --------------------

const llmCall: GraphNode<any> = async (state) => {
  const result = await llm.invoke([
    {
      role: "system",
      content: "Write a report section using the given section information.",
    },
    {
      role: "user",
      content: `Section name: ${state.section.name}
         Description: ${state.section.description}`,
    },
  ]);

  return {
    completedSections: [String(result.content)],
  };
};

// --------------------
// Orchestrator
// --------------------

const orchestrator: GraphNode<typeof State> = async (state) => {
  const plan = await planner.invoke([
    {
      role: "system",
      content: "Create sections for a report.",
    },
    {
      role: "user",
      content: state.topic,
    },
  ]);

  return {
    sections: plan.sections,
  };
};

// --------------------
// Assign workers
// --------------------

const assignWorkers: ConditionalEdgeRouter<
  typeof State,
  Record<string, any>,
  "llmCall"
> = (state) => {
  return state.sections.map(
    (section) =>
      new Send("llmCall", {
        section,
      } as any),
  );
};

// --------------------
// Synthesizer
// --------------------

const synthesizer: GraphNode<typeof State> = async (state) => {
  return {
    finalReport: state.completedSections.join("\n\n---\n\n"),
  };
};

// --------------------
// Build graph
// --------------------

const graph = new StateGraph(State)

  .addNode("orchestrator", orchestrator)

  .addNode("llmCall", llmCall)

  .addNode("synthesizer", synthesizer)

  .addEdge("__start__", "orchestrator")

  .addConditionalEdges("orchestrator", assignWorkers, ["llmCall"])

  .addEdge("llmCall", "synthesizer")

  .addEdge("synthesizer", "__end__")

  .compile();

// --------------------
// Run
// --------------------

const result = await graph.invoke({
  topic: "Create a report on LLM scaling laws",
  sections: [],
  completedSections: [],
  finalReport: "",
});

console.log(result.finalReport);
