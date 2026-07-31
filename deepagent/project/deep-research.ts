import { createDeepAgent, type SubAgent } from "deepagents";
import { tool, todoListMiddleware } from "langchain";
import { z } from "zod";
import {
  RESEARCHER_INSTRUCTIONS,
  RESEARCH_WORKFLOW_INSTRUCTIONS,
  SUBAGENT_DELEGATION_INSTRUCTIONS,
} from "./prompts";
import { ChatGoogle } from "@langchain/google";

interface TavilyResult {
  url: string;
  title: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

const tavilySearchSchema = z.object({
  query: z.string().describe("The search query to look up on the web."),
  maxResults: z
    .number()
    .optional()
    .default(1)
    .describe("The maximum number of search results to return."),
  topic: z
    .enum(["general", "news", "finance"])
    .optional()
    .default("general")
    .describe(
      "The topic of the search query, which can influence the search results.",
    ),
});
type TavilySearchInput = z.infer<typeof tavilySearchSchema>;

async function fetchWebPageContent(
  url: string,
  timeout: number = 10_000,
): Promise<string> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) {
      return `Failed to fetch ${url}: ${response.status} ${response.statusText}`;
    }
    return await response.text();
  } catch (error) {
    return `Error fetching ${url}: ${error}`;
  }
}

const tavilySearch = tool(
  async ({ query, maxResults = 1, topic = "general" }: TavilySearchInput) => {
    const response = await fetch("https://api.tavily.com/search", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({ query, max_results: maxResults, topic }),
    });
    const data = (await response.json()) as TavilyResponse;
    const results = data?.results ?? [];
    const resultText: string[] = [];
    for (const result of results) {
      const content = await fetchWebPageContent(result.url);
      resultText.push(
        `## ${result.title}\n**URL:** ${result.url}\n\n${content}\n---`,
      );
    }
    return (
      `Found ${resultText.length} result(s) for '${query}':\n\n` +
      resultText.join("\n")
    );
  },
  {
    name: "tavily_search",
    description:
      "Search the web for information on a given query. Uses Tavily to discover relevant URLs, then fetches and returns full webpage content.",
    schema: tavilySearchSchema,
  },
);

const maxConcurrentResearchUnits = 3;
const maxResearcherIterations = 3;

const currentDate = new Date().toISOString().split("T")[0] ?? "";

const INSTRUCTIONS =
  RESEARCH_WORKFLOW_INSTRUCTIONS +
  "\n\n" +
  "=".repeat(80) +
  "\n\n" +
  SUBAGENT_DELEGATION_INSTRUCTIONS.replace(
    "{maxConcurrentResearchUnits}",
    String(maxConcurrentResearchUnits),
  ).replace("{maxResearcherIterations}", String(maxResearcherIterations));

const researchSubAgent: SubAgent = {
  name: "research-agent",
  description: "Delegate research to the sub-agent. Give one topic at a time.",
  systemPrompt: RESEARCHER_INSTRUCTIONS.replace("{date}", currentDate),
  tools: [tavilySearch],
};

const model = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
});

const agent = createDeepAgent({
  model,
  tools: [tavilySearch],
  subagents: [researchSubAgent],
  systemPrompt: INSTRUCTIONS,
  middleware: [todoListMiddleware()],
});

async function main() {
  const stream = await agent.streamEvents(
    {
      messages: [
        {
          role: "user",
          content: "Compare Python vs JavaScript for web development",
        },
      ],
    },
    { version: "v3" },
  );
  for await (const message of stream.messages) {
    for await (const token of message.text) {
      process.stdout.write(token);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
