import { describe, expect, test } from "bun:test";
import { AIMessage, createAgent, fakeModel } from "langchain";

describe("Agent Tests", () => {
  test("Responds with hi", async () => {
    const model = fakeModel().respond(new AIMessage("Hi there!"));

    const agent = createAgent({
      model,
      tools: [],
    });

    const result = await agent.invoke({
      messages: [{ role: "human", content: "hi" }],
    });

    expect(result.messages.at(-1)?.content).toBe("Hi there!");

    expect(model.callCount).toBe(1);
  });
});
