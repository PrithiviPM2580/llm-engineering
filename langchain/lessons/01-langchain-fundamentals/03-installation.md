# Lesson 03 — Installation and Project Setup

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Set up a professional TypeScript + Node.js environment for building LangChain applications.

By the end of this lesson, you will have:

- A working TypeScript LangChain project
- Installed LangChain packages
- Environment variable configuration
- Project structure for future lessons
- Your first LangChain application

---

# 1. Requirements

Before installing LangChain, you need:

## Node.js

LangChain for JavaScript runs on Node.js.

Check installation:

```bash
node --version
```

Example:

```
v22.x.x
```

---

## npm

Check:

```bash
npm --version
```

Example:

```
10.x.x
```

---

# 2. Create Project

Create the root project:

```bash
mkdir ai-agent-engineering

cd ai-agent-engineering
```

Initialize Node project:

```bash
npm init -y
```

This creates:

```
package.json
```

---

# 3. Install TypeScript

Install TypeScript:

```bash
npm install -D typescript tsx @types/node
```

Packages:

## typescript

Provides TypeScript compiler.

---

## tsx

Runs TypeScript files directly.

Example:

```bash
tsx app.ts
```

No manual compilation required.

---

## @types/node

Provides Node.js TypeScript definitions.

---

# 4. Create TypeScript Configuration

Create:

```
tsconfig.json
```

Example:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true
  }
}
```

---

# Configuration Explanation

## target

```json
"target":"ES2022"
```

Specifies JavaScript version.

---

## module

```json
"module":"NodeNext"
```

Uses modern Node.js module system.

---

## strict

```json
"strict":true
```

Enables TypeScript safety checks.

---

# 5. Install LangChain Packages

LangChain JavaScript uses separate packages.

Install core:

```bash
npm install @langchain/core
```

---

Install LangChain utilities:

```bash
npm install langchain
```

---

Install community integrations:

```bash
npm install @langchain/community
```

---

Install OpenAI integration:

```bash
npm install @langchain/openai
```

---

# Complete Installation

Your dependencies:

```
package.json

dependencies:

@langchain/core

langchain

@langchain/community

@langchain/openai

```

---

# 6. Install Environment Variables Package

Install:

```bash
npm install dotenv
```

Used for loading API keys.

---

# 7. Project Structure

Recommended structure:

```
ai-agent-engineering/

│

├── src/

│   ├── index.ts

│   ├── models/

│   ├── prompts/

│   ├── chains/

│   ├── tools/

│   ├── agents/

│   └── utils/

│

├── lessons/

│

├── projects/

│

├── examples/

│

├── .env

├── .env.example

├── package.json

└── tsconfig.json

```

---

# 8. Environment Variables

Create:

```
.env
```

Example:

```
OPENAI_API_KEY=your_api_key_here
```

---

Create:

```
.env.example
```

Content:

```
OPENAI_API_KEY=
```

Never commit:

```
.env
```

to Git.

---

# 9. Configure npm Scripts

Open:

```
package.json
```

Add:

```json
{
  "scripts": {
    "dev": "tsx src/index.ts"
  }
}
```

Now run:

```bash
npm run dev
```

---

# 10. Your First LangChain Application

Create:

```
src/index.ts
```

Code:

```typescript
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";

async function main() {
  const model = new ChatOpenAI({
    model: "gpt-4.1-mini",
    temperature: 0,
  });

  const response = await model.invoke("Explain LangChain in one sentence");

  console.log(response.content);
}

main();
```

---

# Code Explanation

## Import Environment Variables

```typescript
import "dotenv/config";
```

Loads values from:

```
.env
```

Example:

```
OPENAI_API_KEY
```

---

## Import Chat Model

```typescript
import { ChatOpenAI } from "@langchain/openai";
```

Imports LangChain OpenAI integration.

---

## Create Model

```typescript
const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0,
});
```

Creates a connection to OpenAI.

---

## model option

```typescript
model: "gpt-4.1-mini";
```

Defines which model to use.

---

## temperature

```typescript
temperature: 0;
```

Controls randomness.

```
0 = deterministic

1 = creative

```

---

## Invoke Model

```typescript
model.invoke();
```

Sends input to the model.

Flow:

```
Your Code

 |

ChatOpenAI

 |

OpenAI API

 |

Response

```

---

## Print Response

```typescript
console.log(response.content);
```

Displays model output.

---

# 11. Running The Application

Run:

```bash
npm run dev
```

Expected:

```
LangChain is a framework for building applications with language models.
```

---

# 12. Understanding The First Architecture

Your code:

```
index.ts

    |

    v

ChatOpenAI

    |

    v

OpenAI API

    |

    v

Response

```

This is the smallest LangChain application.

---

# 13. Common Installation Mistakes

---

## Mistake 1

Installing old packages.

Old:

```
langchain/openai
```

Modern:

```
@langchain/openai
```

---

## Mistake 2

Putting API keys directly in code.

Bad:

```typescript
const key = "sk-xxxxx";
```

Use:

```
.env
```

---

## Mistake 3

Using JavaScript instead of TypeScript for a large project.

For production LangChain applications:

Recommended:

```
TypeScript + Node.js
```

---

# 14. Debugging Tips

## Check installed packages

Run:

```bash
npm list
```

---

## Check environment variables

Temporary:

```typescript
console.log(process.env.OPENAI_API_KEY);
```

Remove after testing.

---

## API errors

Common causes:

- Wrong API key
- Missing environment variable
- Wrong model name
- No provider access

---

# 15. Best Practices

Use:

```
src/

models/

prompts/

chains/

tools/

```

Separate:

- Configuration
- Business logic
- Prompts
- AI components

Keep secrets outside code.

Use:

```
.env
```

---

# Exercise

Complete:

## Task 1

Create a TypeScript LangChain project.

---

## Task 2

Install:

```
@langchain/core

langchain

@langchain/openai

```

---

## Task 3

Create a ChatOpenAI instance.

---

## Task 4

Invoke:

```
Explain what a Runnable is.
```

---

## Task 5

Modify temperature:

```
0

0.5

1
```

Observe differences.

---

# Mini Project

## Project: First AI Console Assistant

Create:

```
projects/

01-ai-console-assistant/

```

Structure:

```
01-ai-console-assistant/

├── src/

│   └── index.ts

├── .env

├── package.json

└── README.md

```

Requirements:

The application should:

- Accept a user question
- Send it to LangChain Chat Model
- Display the answer

Architecture:

```
User

 |

Console Input

 |

LangChain

 |

Chat Model

 |

Response

```

---

# Next Lesson

Continue with:

```
04-packages.md
```

Topics:

- @langchain/core
- langchain
- @langchain/community
- Provider packages
- When to use each package
- Package architecture in production projects
