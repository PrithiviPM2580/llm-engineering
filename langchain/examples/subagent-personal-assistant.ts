import "dotenv/config";
import { ChatOpenRouter } from "@langchain/openrouter";
import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

const createCalenderEventSchema = z.object({
  title: z.string().describe("The title of the event"),
  startTime: z.string().describe("ISO format: 2024-01-15"),
  endTime: z.string().describe("ISO format: 2024-01-15"),
  attendees: z
    .array(z.string())
    .describe("The list of attendees for the event"),
  location: z.string().optional().describe("The location of the event"),
});

const sendEmailSchema = z.object({
  to: z.array(z.string()).describe("The list of recipients for the email"),
  subject: z.string().describe("The subject of the email"),
  body: z.string().describe("The body of the email"),
  cc: z
    .array(z.string())
    .optional()
    .describe("The list of cc recipients for the email"),
});

const getAvailabilitySlotSchema = z.object({
  attendees: z
    .array(z.string())
    .optional()
    .describe("The list of attendees to check availability for"),
  date: z.string().describe("ISO format: 2024-01-15"),
  durationMinutes: z
    .number()
    .describe("The duration of the meeting in minutes"),
});

const llm = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: "openrouter/free",
});

const createCalenderEvent = tool(
  async ({ title, startTime, endTime, attendees, location }) => {
    return `Event created: ${title} from ${startTime} to ${endTime} with ${attendees.length} attendees.`;
  },
  {
    name: "create_calendar_event",
    description:
      "Create a calendar event. Requires the ISO format datetime format.",
    schema: createCalenderEventSchema,
  },
);

const sendEmail = tool(
  async ({ to, subject, body, cc }) => {
    return `Email sent to ${to.join(", ")} - Subject: ${subject}`;
  },
  {
    name: "send_email",
    description:
      "Send an email to a list of recipients. Requires the subject, body, and list of recipients.",
    schema: sendEmailSchema,
  },
);

const getAvailabilitySlot = tool(
  async ({ attendees, date, durationMinutes }) => {
    return ["09:00", "14:00", "16:00"];
  },
  {
    name: "get_availability_slot",
    description:
      "Check calendar availability for given attendees on a specific date.",
    schema: getAvailabilitySlotSchema,
  },
);

const CALENDAR_AGENT_PROMPT = `
You are a calendar scheduling assistant.
Parse natural language scheduling requests (e.g., 'next Tuesday at 2pm')
into proper ISO datetime formats.
Use get_availability_slot to check availability when needed.
If there is no suitable time slot, stop and confirm unavailability in your response.
Use create_calendar_event to schedule events.
Always confirm what was scheduled in your final response.
`.trim();

const calendarAgent = createAgent({
  model: llm,
  tools: [createCalenderEvent, sendEmail, getAvailabilitySlot],
  systemPrompt: CALENDAR_AGENT_PROMPT,
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: { create_calendar_event: true },
      descriptionPrefix: "Calendar event pending approval",
    }),
  ],
});

const EMAIL_AGENT_PROMPT = `
You are an email assistant.
Compose professional emails based on natural language requests.
Extract recipient information and craft appropriate subject lines and body text.
Use send_email to send the message.
Always confirm what was sent in your final response.
`.trim();

const emailAgent = createAgent({
  model: llm,
  tools: [sendEmail],
  systemPrompt: EMAIL_AGENT_PROMPT,
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: { send_email: true },
      descriptionPrefix: "Outbound email pending approval",
    }),
  ],
});

const scheduleEvent = tool(
  async ({ request }) => {
    const result = await calendarAgent.invoke({
      messages: [{ role: "user", content: request }],
    });
    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage?.text;
  },
  {
    name: "schedule_event",
    description: `
Schedule calendar events using natural language.

Use this when the user wants to create, modify, or check calendar appointments.
Handles date/time parsing, availability checking, and event creation.

Input: Natural language scheduling request (e.g., 'meeting with design team next Tuesday at 2pm')
    `.trim(),
    schema: z.object({
      request: z.string().describe("Natural language scheduling request"),
    }),
  },
);

const manageEmail = tool(
  async ({ request }) => {
    const result = await emailAgent.invoke({
      messages: [{ role: "user", content: request }],
    });
    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage?.text;
  },
  {
    name: "manage_email",
    description: `
Send emails using natural language.

Use this when the user wants to send notifications, reminders, or any email communication.
Handles recipient extraction, subject generation, and email composition.

Input: Natural language email request (e.g., 'send them a reminder about the meeting')
    `.trim(),
    schema: z.object({
      request: z.string().describe("Natural language email request"),
    }),
  },
);

const supervisorAgent = createAgent({
  model: llm,
  tools: [scheduleEvent, manageEmail],
  checkpointer: new MemorySaver(),
  systemPrompt: `
You are a helpful personal assistant.
You can schedule calendar events and send emails.
Break down user requests into appropriate tool calls and coordinate the results.
When a request involves multiple actions, use multiple tools in sequence.
  `.trim(),
});

const query =
  "Schedule a meeting with the design team next Tuesday at 2pm for 1 hour, " +
  "and send them an email reminder about reviewing the new mockups.";

const config = { configurable: { thread_id: "6" } };

const interrupts: any[] = [];
const stream = await supervisorAgent.streamEvents(
  { messages: [{ role: "user", content: query }] },
  { ...config, version: "v3" },
);

await Promise.all([
  (async () => {
    for await (const message of stream.messages) {
      for await (const token of message.text) {
        process.stdout.write(token);
      }
    }
  })(),
  (async () => {
    for await (const call of stream.toolCalls) {
      console.log(`\nTool call: ${call.name}(${JSON.stringify(call.input)})`);
    }
  })(),
]);
if (stream.interrupted) {
  for (const interrupt of stream.interrupts) {
    interrupts.push(interrupt);
    console.log(`\nINTERRUPTED: ${interrupt.interruptId}`);
  }
}
