# Lesson 06 — Chat Models

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand Chat Models in LangChain, how they work, how they connect with AI providers, and how they fit into a LangChain application.

By the end of this lesson, you should understand:

- What Chat Models are
- Difference between LLMs and Chat Models
- Chat Model architecture
- Provider integrations
- Model configuration
- Chat model inputs and outputs
- invoke(), batch(), stream()
- Common model parameters
- Best practices

---

# 1. What is a Chat Model?

A Chat Model is a LangChain component that communicates with conversational AI models.

Examples:

- OpenAI GPT models
- Anthropic Claude models
- Google Gemini models

A Chat Model receives messages and produces AI responses.

Basic flow:

```
User

 |

Messages

 |

Chat Model

 |

AI Response

```

---

# 2. LLM vs Chat Model

A common beginner confusion:

```
LLM

vs

Chat Model

```

---

# Traditional LLM

Traditional language models work with text.

Example:

Input:

```
Explain LangChain
```

Output:

```
LangChain is a framework...
```

Flow:

```
Text

 |

LLM

 |

Text

```

---

# Chat Model

Chat models work with structured messages.

Input:

```
[
 SystemMessage,
 HumanMessage
]

```

Output:

```
AIMessage

```

Flow:

```
Messages

 |

Chat Model

 |

AI Message

```

---

# Why Chat Models Exist?

Modern AI applications need conversations.

Example:

```
System:

You are a coding assistant.


Human:

Explain TypeScript.


AI:

TypeScript is...

```

Messages provide:

- Roles
- Context
- Conversation history
- Tool communication

---

# 3. Chat Model Architecture

High-level architecture:

```
                Application


                     |

                     v


              LangChain Model


                     |

                     v


            Provider Integration


        --------------------------------


        |              |               |


     OpenAI       Anthropic       Gemini


        |              |               |


        --------------------------------


                     |

                     v


                 AI Model


                     |

                     v


              AI Response

```

---

# 4. Chat Model Lifecycle

When you call a Chat Model:

```
Your Code

   |

   v

Create Messages

   |

   v

Send Request

   |

   v

Provider API

   |

   v

AI Generation

   |

   v

Receive Response

   |

   v

AIMessage

```

---

# 5. Installing Chat Model Provider

For OpenAI:

```bash
npm install @langchain/openai
```

---

# 6. Creating a Chat Model

Example:

```typescript
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0,
});

const response = await model.invoke("Explain LangChain");

console.log(response.content);
```

---

# Code Explanation

---

## Import Environment Variables

```typescript
import "dotenv/config";
```

Loads:

```
.env
```

Example:

```
OPENAI_API_KEY=xxxxx
```

---

## Import Chat Model

```typescript
import { ChatOpenAI } from "@langchain/openai";
```

Imports the OpenAI Chat Model integration.

---

## Create Model Instance

```typescript
const model = new ChatOpenAI({
```

Creates a LangChain model object.

---

## Select Model

```typescript
model: "gpt-4.1-mini";
```

Defines which AI model to use.

---

## Temperature

```typescript
temperature: 0;
```

Controls randomness.

```
0

More predictable


1

More creative

```

---

## Invoke

```typescript
model.invoke();
```

Sends input to the model.

---

## Response

```typescript
response.content;
```

Gets generated text.

---

# 7. Chat Model Inputs

Chat Models accept messages.

Example:

```typescript
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const messages = [
  new SystemMessage("You are a helpful assistant"),

  new HumanMessage("Explain LangChain"),
];

const response = await model.invoke(messages);

console.log(response.content);
```

---

# Execution:

```
System Message

        |

Human Message

        |

        v

    Chat Model

        |

        v

    AI Message

```

---

# 8. Message Roles

Chat models understand different roles.

---

# System Message

Defines behavior.

Example:

```
You are an expert TypeScript developer.
```

---

# Human Message

User input.

Example:

```
Explain interfaces.
```

---

# AI Message

Model response.

Example:

```
Interfaces define contracts...
```

---

# Tool Message

Used when models interact with tools.

Example:

```
Tool result:

Weather: 25°C

```

---

# 9. Model Parameters

Chat models have configurable options.

---

# Temperature

Controls creativity.

```
0

↓

More deterministic


1

↓

More creative

```

---

# Max Tokens

Controls response length.

Example:

```typescript
maxTokens: 500;
```

---

# Timeout

Controls request waiting time.

Example:

```typescript
timeout: 30000;
```

---

# Streaming

Enable token-by-token output.

Example:

```
Lang

LangChain

LangChain is

LangChain is a framework

```

---

# 10. Batch Execution

For multiple requests:

```typescript
const responses = await model.batch(["Explain RAG", "Explain Agents"]);
```

Flow:

```
Input 1
Input 2

   |

 batch()

   |

Output 1
Output 2

```

---

# 11. Streaming Responses

Streaming improves user experience.

Without streaming:

```
User

(wait)

Complete answer appears

```

With streaming:

```
User

L

La

Lan

LangChain

```

Example:

```typescript
const stream = await model.stream("Explain LangChain");

for await (const chunk of stream) {
  console.log(chunk.content);
}
```

---

# 12. Multiple Providers

LangChain provides a common interface.

Example:

OpenAI:

```
ChatOpenAI

```

Anthropic:

```
ChatAnthropic

```

Google:

```
ChatGoogleGenerativeAI

```

Your application:

```
        Chat Model Interface


                 |


 --------------------------------


 OpenAI       Claude       Gemini

```

---

# 13. Why Provider Abstraction Matters

Without LangChain:

Changing providers:

```
Rewrite API code

Rewrite message handling

Rewrite response handling

```

With LangChain:

```
Change:

ChatOpenAI


To:

ChatAnthropic

```

Application logic remains similar.

---

# 14. Common Mistakes

---

## Mistake 1

Confusing model with LangChain.

Wrong:

```
LangChain generates answers

```

Correct:

```
Model generates answers

LangChain manages workflow

```

---

## Mistake 2

Hardcoding prompts inside model calls.

Bad:

```typescript
model.invoke("answer this");
```

Better:

```
Prompt Template

        |

      Model

```

---

## Mistake 3

Ignoring message roles.

Bad:

```
One giant text prompt

```

Better:

```
System

Human

AI

```

---

# 15. Debugging Chat Models

When debugging:

## Check API Key

```
OPENAI_API_KEY
```

---

## Check model name

Example:

```
gpt-4.1-mini
```

---

## Check input format

String:

```
"Hello"
```

or messages:

```
[
 HumanMessage()
]

```

---

## Log response

```typescript
console.log(response);
```

Inspect:

- content
- metadata
- response information

---

# 16. Best Practices

- Use environment variables
- Keep model configuration separate
- Use messages for conversations
- Use streaming for chat interfaces
- Use temperature intentionally
- Choose models based on task requirements

---

# Exercise

Answer:

## Question 1

What is the difference between an LLM and a Chat Model?

---

## Question 2

What are the four common message types?

---

## Question 3

What does temperature control?

---

## Question 4

Why does LangChain provide provider abstractions?

---

## Question 5

Draw the Chat Model execution flow.

---

# Mini Project

## Project: AI Console Chat

Create:

```
projects/

04-ai-console-chat/

```

Structure:

```
src/

└── index.ts

```

Requirements:

Build a console application that:

1. Creates a ChatOpenAI model
2. Accepts user questions
3. Sends messages
4. Prints responses

Architecture:

```
User

 |

Console Input

 |

HumanMessage

 |

Chat Model

 |

AIMessage

 |

Console Output

```

---

# Next Lesson

Continue with:

```
07-messages.md
```

Topics:

- Message architecture
- SystemMessage
- HumanMessage
- AIMessage
- ToolMessage
- Message history
- How conversations work internally
