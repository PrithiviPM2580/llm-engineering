customer-support-agent/

│
├── src/
│ │
│ ├── index.ts # CLI entry point
│ │
│ ├── agent/
│ │ ├── agent.ts # LangChain create_agent setup
│ │ ├── prompts.ts # System prompts
│ │ └── memory.ts # Conversation memory
│ │
│ ├── tools/
│ │ ├── documentSearch.ts # Pinecone search tool
│ │ ├── customerTool.ts # MongoDB customer lookup
│ │ ├── orderTool.ts # MongoDB order lookup
│ │ └── ticketTool.ts # Create support ticket
│ │
│ ├── database/
│ │ ├── mongodb.ts # Mongo connection
│ │ ├── models/
│ │ │ ├── Customer.ts
│ │ │ ├── Order.ts
│ │ │ └── Ticket.ts
│ │
│ ├── vector/
│ │ ├── pinecone.ts # Pinecone connection
│ │ ├── embeddings.ts # Create embeddings
│ │ └── ingest.ts # Upload documents
│ │
│ ├── llm/
│ │ └── model.ts # OpenAI/Claude/Gemini setup
│ │
│ ├── cli/
│ │ ├── terminal.ts # Read user input
│ │ └── formatter.ts # Format responses
│ │
│ ├── config/
│ │ └── env.ts # Environment variables
│ │
│ └── utils/
│ └── logger.ts
│
├── knowledge/
│ ├── faq/
│ ├── policies/
│ └── product-docs/
│
├── scripts/
│ └── seedDatabase.ts # Insert test data
│
├── tests/
│
├── .env
├── package.json
├── tsconfig.json
└── README.md

Define ShopEase (the fictional company).
Write 8–10 knowledge documents (.md files).
Design the MongoDB collections (customers, orders, tickets).
Seed MongoDB with sample data.
Ingest the documents into Pinecone.
Build and test the retrieval system.
Create LangChain tools.
Assemble the customer support agent.
Build the CLI to chat with the agent.
