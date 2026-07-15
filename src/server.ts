import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "llm-engineering",
  version: "0.0.1",
});

server.registerTool(
  "add-tool",
  {
    title: "Add Numbers",
    description: "Adds two numbers together",
    inputSchema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
  },
  async ({ a, b }) => {
    const result = a + b;

    return {
      content: [
        {
          type: "text",
          text: `The sum of ${a} and ${b} is ${result}.`,
        },
      ],
    };
  },
);

server.registerTool(
  "greet",
  {
    title: "Greeting Tool",
    description: "Greets a person",
    inputSchema: z.object({
      name: z.string(),
    }),
  },
  async ({ name }) => {
    return {
      content: [
        {
          type: "text",
          text: `Hello ${name}! Welcome.`,
        },
      ],
    };
  },
);

server.registerTool(
  "current-date",
  {
    title: "Current Date",
    description: "Returns today's date",
    inputSchema: z.object({}),
  },
  async () => {
    return {
      content: [
        {
          type: "text",
          text: new Date().toISOString(),
        },
      ],
    };
  },
);

server.registerTool(
  "calculate-bmi",
  {
    title: "BMI Calculator",
    description: "Calculates Body Mass Index",
    inputSchema: z.object({
      weight: z.number().describe("Weight in kilograms"),
      height: z.number().describe("Height in meters"),
    }),
  },
  async ({ weight, height }) => {
    const bmi = weight / (height * height);

    return {
      content: [
        {
          type: "text",
          text: `Your BMI is ${bmi.toFixed(2)}.`,
        },
      ],
    };
  },
);

const transort = new StdioServerTransport();
await server.connect(transort);
