import "dotenv/config";
import { ChatGoogle } from "@langchain/google";
import { task, entrypoint } from "@langchain/langgraph";

const llm = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
});

const generateJoke = task("generateJoke", async (topic: string) => {
  const msg = await llm.invoke(`Write a short joke about ${topic}`);
  return String(msg.content);
});

const generateStory = task("generateStory", async (topic: string) => {
  const msg = await llm.invoke(`Write a short story about ${topic}`);
  return String(msg.content);
});

const generatePoem = task("generatePoem", async (topic: string) => {
  const msg = await llm.invoke(`Write a short poem about ${topic}`);
  return String(msg.content);
});

const aggregrator = task(
  "aggregrator",
  async (params: {
    topic: string;
    joke: string;
    story: string;
    poem: string;
  }) => {
    return (
      `Here's a story, joke, and poem about ${params.topic}!\n\n` +
      `STORY:\n${params.story}\n\n` +
      `JOKE:\n${params.joke}\n\n` +
      `POEM:\n${params.poem}`
    );
  },
);

const workflow = entrypoint("workflow", async (topic: string) => {
  const [joke, story, poem] = await Promise.all([
    generateJoke(topic),
    generateStory(topic),
    generatePoem(topic),
  ]);
  return aggregrator({ topic, joke, story, poem });
});

const stream = await workflow.streamEvents("cats", { version: "v3" });
for await (const event of stream.values) {
  console.log(event);
}
