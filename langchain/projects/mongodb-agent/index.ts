import "dotenv/config";
import { createAgent, tool } from "langchain";
import { db } from "./db";
import {
  aggregateDocumentsSchema,
  countDocumentsSchema,
  findDocumentsSchema,
} from "./schema";
import { ChatOpenRouter } from "node_modules/@langchain/openrouter/dist/chat_models";
import { getSystemPrompt } from "./prompt";
import { Command, MemorySaver } from "@langchain/langgraph";
import { humanInTheLoopMiddleware } from "langchain";
import type { InterruptPayload } from "@langchain/langgraph";

interface MongoApprovalPayload {
  actionRequests: {
    name: string;
    args: Record<string, unknown>;
    description: string;
  }[];

  reviewConfigs: {
    actionName: string;
    allowedDecisions: string[];
  }[];
}

export async function getSchema() {
  const collections = await db.listCollections().toArray();

  const result = [];

  for (const { name } of collections) {
    const collection = db.collection(name);

    const indexes = await collection.indexes();

    const samples = await collection.find().limit(3).toArray();

    const fields = new Set<string>();

    for (const docs of samples) {
      Object.keys(docs).forEach((key) => fields.add(key));
    }

    result.push({
      collection: name,
      fields: [...fields],
      indexes,
      sample: samples,
    });
  }

  return result;
}

const findDocuments = tool(
  async ({ collection, filter, projection, limit }) => {
    try {
      const result = await db
        .collection(collection)
        .find(filter || {})
        .project(projection || {})
        .limit(limit || 5)
        .toArray();

      return JSON.stringify(result, null, 2);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message);
    }
  },
  {
    name: "find_documents",
    description:
      "Find documents in a MongoDB collection. Use this for simple lookups. This tool is READ-ONLY.",
    schema: findDocumentsSchema,
  },
);

const aggregateDocuments = tool(
  async ({ collection, pipeline }) => {
    try {
      const result = await db
        .collection(collection)
        .aggregate(pipeline)
        .toArray();

      return JSON.stringify(result, null, 2);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message);
    }
  },
  {
    name: "aggregate_documents",
    description:
      "Run a MongoDB aggregation pipeline for analytics and reports. READ-ONLY only.",
    schema: aggregateDocumentsSchema,
  },
);

const countDocuments = tool(
  async ({ collection, filter }) => {
    try {
      const result = await db
        .collection(collection)
        .countDocuments(filter || {});

      return JSON.stringify(result, null, 2);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message);
    }
  },
  {
    name: "count_documents",
    description:
      "Count the number of documents in a MongoDB collection. READ-ONLY only.",
    schema: countDocumentsSchema,
  },
);

const listCollections = tool(
  async () => {
    try {
      const result = await db.listCollections().toArray();

      return JSON.stringify(result, null, 2);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(message);
    }
  },
  {
    name: "list_collections",
    description:
      "List all collections in the MongoDB database. READ-ONLY only.",
  },
);

const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
});

const agent = createAgent({
  model,
  tools: [findDocuments, aggregateDocuments, countDocuments, listCollections],
  systemPrompt: await getSystemPrompt(),
  checkpointer: new MemorySaver(),
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        find_documents: true,
      },
      descriptionPrefix: "Tool execution pending approve.",
    }),
  ],
});

async function consumeStream(stream: any, label: string) {
  console.log("\n================================");
  console.log(`STREAM START: ${label}`);
  console.log("================================\n");

  await Promise.all([
    (async () => {
      for await (const message of stream.messages) {
        console.log("\n--- MESSAGE EVENT ---");

        for await (const token of message.text) {
          process.stdout.write(token);
        }

        console.log("\n--- END MESSAGE ---");
      }
    })(),

    (async () => {
      for await (const call of stream.toolCalls) {
        console.log("\n--- TOOL CALL ---");
        console.log("Tool:", call.name);
        console.log("Arguments:", JSON.stringify(call.input, null, 2));
        console.log("--- END TOOL CALL ---");
      }
    })(),
  ]);

  console.log("\n================================");
  console.log(`STREAM END: ${label}`);
  console.log("================================\n");
}

const question =
  "List all users who are developers and are older than 30 years.";

const config = {
  configurable: {
    thread_id: "1",
  },
};

console.log("\nUSER QUESTION:");
console.log(question);

console.log("\n🚀 STARTING AGENT...\n");

const stream = await agent.streamEvents(
  {
    messages: [
      {
        role: "human",
        content: question,
      },
    ],
  },
  {
    ...config,
    version: "v3",
  },
);

await consumeStream(stream, "FIRST RUN");

if (stream.interrupted) {
  console.log("\n");
  console.log("================================");
  console.log("⏸️ AGENT INTERRUPTED");
  console.log("================================");

  for (const interrupt of stream.interrupts) {
    const payload = interrupt.payload as MongoApprovalPayload;

    console.log("\nInterrupt ID:");
    console.log(interrupt.interruptId);

    console.log("\nPending Actions:");

    for (const request of payload.actionRequests) {
      console.log("\nTool:");
      console.log(request.name);

      console.log("\nArguments:");
      console.log(JSON.stringify(request.args, null, 2));

      console.log("\nDescription:");
      console.log(request.description);
    }

    console.log("\nAvailable Decisions:");

    for (const config of payload.reviewConfigs) {
      console.log(config.allowedDecisions);
    }
  }

  console.log("\n");
  console.log("================================");
  console.log("👤 HUMAN APPROVES TOOL CALL");
  console.log("================================\n");

  const resumeStream = await agent.streamEvents(
    new Command({
      resume: {
        decisions: [
          {
            type: "approve",
          },
        ],
      },
    }),
    {
      ...config,
      version: "v3",
    },
  );

  await consumeStream(resumeStream, "RESUME RUN");

  if (resumeStream.interrupted) {
    console.log("Agent interrupted again");
  }

  console.log("\n");
  console.log("================================");
  console.log("✅ AGENT FINISHED");
  console.log("================================");
}
