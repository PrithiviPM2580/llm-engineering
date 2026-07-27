import "dotenv/config";
import { ChatGoogle } from "@langchain/google";
import { HumanMessage } from "@langchain/core/messages";
import {
  StateGraph,
  StateSchema,
  Command,
  MemorySaver,
  interrupt,
  START,
  END,
  type GraphNode,
} from "@langchain/langgraph";
import * as z from "zod";

// =======================
// LLM
// =======================

const llm = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash",
  temperature: 0,
});

// =======================
// Schemas
// =======================

const EmailClassificationSchema = z.object({
  intent: z.enum(["question", "bug", "billing", "feature", "complex"]),

  urgency: z.enum(["low", "medium", "high", "critical"]),

  topic: z.string(),
  summary: z.string(),
});

const EmailAgentState = new StateSchema({
  // incoming email
  emailContent: z.string(),
  senderEmail: z.string(),
  emailId: z.string(),

  // optional customer info
  customerId: z.string().optional(),

  // AI generated data
  classification: EmailClassificationSchema.optional(),

  searchResults: z.array(z.string()).optional(),

  customerHistory: z.record(z.string(), z.any()).optional(),

  responseText: z.string().optional(),
});

type EmailState = typeof EmailAgentState.State;

// =======================
// Fake external services
// Replace these with APIs
// =======================

async function fetchCustomerHistory(customerId: string) {
  return {
    id: customerId,
    tier: "premium",
    previousTickets: 3,
  };
}

async function sendEmail(email: string) {
  console.log("EMAIL SENT:", email.substring(0, 100));
}

// =======================
// Nodes
// =======================

// 1. Read email

const readEmail: GraphNode<typeof EmailAgentState> = async (state) => {
  console.log("Reading email:", state.emailContent);

  return {};
};

// 2. Classify email

const classifyIntent: GraphNode<typeof EmailAgentState> = async (state) => {
  const structured = llm.withStructuredOutput(EmailClassificationSchema);

  const classification = await structured.invoke(`

Analyze this customer email.

Email:
${state.emailContent}

Sender:
${state.senderEmail}

Return:
intent,
urgency,
topic,
summary

`);

  let next: string;

  if (
    classification.intent === "billing" ||
    classification.urgency === "critical"
  ) {
    next = "lookupCustomerHistory";
  } else if (classification.intent === "bug") {
    next = "createBugTicket";
  } else if (
    classification.intent === "question" ||
    classification.intent === "feature"
  ) {
    next = "searchDocumentation";
  } else {
    next = "draftResponse";
  }

  return new Command({
    update: {
      classification,
    },

    goto: next,
  });
};

// 3. Customer lookup

const lookupCustomerHistory: GraphNode<typeof EmailAgentState> = async (
  state,
) => {
  if (!state.customerId) {
    const customerId = interrupt({
      message: "Customer ID required",
    });

    return new Command({
      update: {
        customerId,
      },

      goto: "lookupCustomerHistory",
    });
  }

  const history = await fetchCustomerHistory(state.customerId);

  return new Command({
    update: {
      customerHistory: history,
    },

    goto: "draftResponse",
  });
};

// 4. Search docs

const searchDocumentation: GraphNode<typeof EmailAgentState> = async (
  state,
) => {
  const classification = state.classification!;

  const results = [
    "Password reset is available from Settings",

    "Password requires 12 characters",

    "Users can update billing information from account settings",
  ];

  return new Command({
    update: {
      searchResults: results,
    },

    goto: "draftResponse",
  });
};

// 5. Bug ticket

const createBugTicket: GraphNode<typeof EmailAgentState> = async () => {
  const ticketId = "BUG-" + Date.now();

  return new Command({
    update: {
      searchResults: [`Created ticket ${ticketId}`],
    },

    goto: "draftResponse",
  });
};

// 6. Draft response

const draftResponse: GraphNode<typeof EmailAgentState> = async (state) => {
  const classification = state.classification!;

  let context = "";

  if (state.searchResults) {
    context += state.searchResults.join("\n");
  }

  if (state.customerHistory) {
    context += `
Customer tier:
${state.customerHistory.tier}
`;
  }

  const result = await llm.invoke([
    new HumanMessage(`

Write a professional customer support reply.

Customer email:

${state.emailContent}


Intent:
${classification.intent}


Urgency:
${classification.urgency}


Context:

${context}


Rules:

- Be polite
- Solve the issue
- Keep it concise

`),
  ]);

  const needsHuman =
    classification.urgency === "high" ||
    classification.urgency === "critical" ||
    classification.intent === "complex";

  return new Command({
    update: {
      responseText: result.content.toString(),
    },

    goto: needsHuman ? "humanReview" : "sendReply",
  });
};

// 7. Human approval

const humanReview: GraphNode<typeof EmailAgentState> = async (state) => {
  const decision = interrupt({
    email: state.emailContent,

    draft: state.responseText,

    action: "Approve or edit reply",
  });

  if (decision.approved) {
    return new Command({
      update: {
        responseText: decision.editedResponse ?? state.responseText,
      },

      goto: "sendReply",
    });
  }

  return new Command({
    goto: END,
  });
};

// 8. Send email

const sendReply: GraphNode<typeof EmailAgentState> = async (state) => {
  await sendEmail(state.responseText!);

  return {};
};

// =======================
// Build graph
// =======================

const workflow = new StateGraph(EmailAgentState)

  .addNode("readEmail", readEmail)

  .addNode("classifyIntent", classifyIntent)

  .addNode("lookupCustomerHistory", lookupCustomerHistory)

  .addNode("searchDocumentation", searchDocumentation, {
    retryPolicy: {
      maxAttempts: 3,
    },
  })

  .addNode("createBugTicket", createBugTicket)

  .addNode("draftResponse", draftResponse)

  .addNode("humanReview", humanReview)

  .addNode("sendReply", sendReply)

  .addEdge(START, "readEmail")

  .addEdge("readEmail", "classifyIntent")

  .addEdge("sendReply", END);

// =======================
// Compile
// =======================

const memory = new MemorySaver();

const app = workflow.compile({
  checkpointer: memory,
});

// =======================
// Test
// =======================

const initialState: EmailState = {
  emailContent: "I was charged twice for my subscription. This is urgent!",
  senderEmail: "customer@example.com",
  emailId: "email_123",
  customerId: undefined,
  classification: undefined,
  searchResults: undefined,
  customerHistory: undefined,
  responseText: undefined,
};

const config = {
  configurable: {
    thread_id: "customer_123",
  },
};

const result = await app.invoke(initialState, config);

console.log("Current state:", result);
