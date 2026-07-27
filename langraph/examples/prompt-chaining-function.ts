import "dotenv/config";
import { task, entrypoint } from "@langchain/langgraph";

import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
});

// Tasks

// First LLM call to generate initial joke
const generateJoke = task("generateJoke", async (topic: string) => {
  const msg = await llm.invoke(`Write a short joke about ${topic}`);
  return String(msg.content);
});

// Gate function to check if the joke has a punchline
function checkPunchline(joke: string) {
  // Simple check - does the joke contain "?" or "!"
  if (joke.includes("?") || joke.includes("!")) {
    return "Pass";
  }
  return "Fail";
}

// Second LLM call to improve the joke

const improveJoke = task("improveJoke", async (joke: string) => {
  const msg = await llm.invoke(
    `Make this joke funnier by adding wordplay: ${joke}`,
  );
  return String(msg.content);
});

// Third LLM call for final polish
const polishJoke = task("polishJoke", async (joke: string) => {
  const msg = await llm.invoke(`Add a surprising twist to this joke: ${joke}`);
  return msg.content;
});

const workflow = entrypoint("jokeMaker", async (topic: string) => {
  const originalJoke = await generateJoke(topic);
  if (checkPunchline(originalJoke) === "Pass") {
    return originalJoke;
  }
  const improvedJoke = await improveJoke(originalJoke);
  const polishedJoke = await polishJoke(improvedJoke);
  return polishedJoke;
});

const stream = await workflow.streamEvents("cats", { version: "v3" });
for await (const snapshot of stream.values) {
  console.log(snapshot);
}
