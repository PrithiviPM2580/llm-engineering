# Lesson 07 — Messages

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand how LangChain represents conversations using messages and how messages flow between users, applications, models, and tools.

By the end of this lesson, you should understand:

- Why messages exist
- Message architecture
- Different message types
- SystemMessage
- HumanMessage
- AIMessage
- ToolMessage
- Message history
- How Chat Models process messages

---

# 1. Why Do Messages Exist?

A beginner might think:

```
User Text

      |

      v

AI Model

      |

      v

Response

```

But modern AI applications need more context.

Examples:

- System instructions
- Previous conversation
- Tool results
- User preferences
- Assistant responses

A single text string cannot represent all this information.

---

# The Problem With Plain Text

Example:

```
You are a helpful assistant.
Explain LangChain.
Previous answer:
LangChain is a framework...
```

Everything is mixed together.

The model cannot clearly know:

- Who said what?
- Which instruction has priority?
- Which text is user input?

---

# Message Solution

LangChain uses structured messages.

Example:

```
[
 SystemMessage,
 HumanMessage,
 AIMessage
]

```

Each message has:

- Role
- Content
- Metadata

---

# 2. Message Architecture

High-level flow:

```
                 Application


                     |

                     v


                Messages


                     |

                     v


              Chat Model


                     |

                     v


                AIMessage


```

---

# Message Object Structure

A message contains:

```
{
 role,
 content,
 metadata
}

```

Example:

```json
{
  "role": "human",
  "content": "Explain LangChain"
}
```

---

# 3. Types of Messages

LangChain provides several message types:

```
SystemMessage

HumanMessage

AIMessage

ToolMessage

```

Each has a specific purpose.

---

# 4. SystemMessage

## Purpose

Defines the behavior and instructions of the AI.

Example:

```
You are an expert TypeScript developer.
```

The system message tells the model:

- How to behave
- What role to play
- What rules to follow

---

Example:

```typescript
import { SystemMessage } from "@langchain/core/messages";

const message = new SystemMessage("You are a helpful AI assistant.");
```

---

Flow:

```
SystemMessage

       |

       v

Chat Model

       |

       v

AI Response

```

---

# 5. HumanMessage

## Purpose

Represents user input.

Example:

```
Explain LangChain
```

Code:

```typescript
import { HumanMessage } from "@langchain/core/messages";

const message = new HumanMessage("Explain LangChain");
```

---

The complete conversation:

```
Human:

Explain LangChain


AI:

LangChain is a framework...

```

---

# 6. AIMessage

## Purpose

Represents the assistant response.

Example:

```
LangChain helps developers build LLM applications.
```

Code:

```typescript
import { AIMessage } from "@langchain/core/messages";

const message = new AIMessage("LangChain is a framework.");
```

---

AIMessage can contain:

- Text response
- Tool calls
- Metadata

---

# 7. ToolMessage

## Purpose

Represents results returned by tools.

Used in agent systems.

Example:

```
AI:

Call weather tool


Tool:

Temperature is 25°C


AI:

The weather is 25°C.

```

Flow:

```
HumanMessage

      |

      v

AIMessage

      |

      v

Tool

      |

      v

ToolMessage

      |

      v

AIMessage

```

---

# 8. Creating a Conversation

Example:

```typescript
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

const messages = [
  new SystemMessage("You are a helpful assistant."),

  new HumanMessage("What is LangChain?"),

  new AIMessage("LangChain is a framework for LLM applications."),
];

console.log(messages);
```

---

# Explanation

## System

```typescript
new SystemMessage();
```

Defines behavior.

---

## Human

```typescript
new HumanMessage();
```

Represents user input.

---

## AI

```typescript
new AIMessage();
```

Stores previous assistant output.

---

# 9. Sending Messages To A Model

Example:

```typescript
const response = await model.invoke(messages);

console.log(response.content);
```

Flow:

```
Message Array

       |

       v

Chat Model

       |

       v

AIMessage

```

---

# 10. Conversation History

Chat applications store previous messages.

Example:

First interaction:

```
Human:

My name is Alex.


AI:

Nice to meet you Alex.

```

Second interaction:

```
Human:

What is my name?

```

The model needs history:

```
[
Human: My name is Alex

AI: Nice to meet you

Human: What is my name?
]

```

---

# Without History

```
Human:

What is my name?


AI:

I don't know.

```

---

# With History

```
Conversation History

          |

          v

       Model


          |

          v


Your name is Alex.

```

---

# 11. Messages Internally

A chat request looks like:

```
[
 {
  role:"system",
  content:"You are helpful"
 },

 {
  role:"user",
  content:"Explain RAG"
 }

]

```

The provider converts this into its own format.

Example:

```
LangChain Message

        |

        v

Provider Adapter

        |

        v

OpenAI Message Format

```

---

# 12. Messages and Runnable System

Messages are often used inside Runnables.

Example:

```
Messages

    |

    v

Chat Model Runnable

    |

    v

AIMessage

```

---

# 13. Messages and Prompt Templates

Later we will use:

```
ChatPromptTemplate

```

which creates messages automatically.

Example:

Template:

```
System:

You are a {role}


Human:

Explain {topic}

```

Input:

```
role = teacher

topic = LangChain

```

Output:

```
SystemMessage

HumanMessage

```

---

# 14. Common Mistakes

---

## Mistake 1

Using one large string for conversations.

Bad:

```
"System:...
User:...
AI:..."

```

Better:

```
SystemMessage

HumanMessage

AIMessage

```

---

## Mistake 2

Ignoring system instructions.

System messages usually have higher priority.

---

## Mistake 3

Forgetting conversation history.

Without history:

```
AI has no memory of previous messages.

```

---

# 15. Debugging Messages

When responses are wrong:

Check:

## Message order

Correct:

```
System

Human

AI

Human

```

---

## Message content

Print:

```typescript
console.log(messages);
```

---

## Message types

Verify:

```
SystemMessage

HumanMessage

AIMessage

```

---

# 16. Best Practices

- Use structured messages
- Keep system instructions clear
- Store conversation history properly
- Avoid unnecessary long history
- Use message types correctly
- Separate user input from system instructions

---

# Exercise

Answer:

## Question 1

Why do we need messages instead of plain text?

---

## Question 2

What is the purpose of SystemMessage?

---

## Question 3

What is the difference between HumanMessage and AIMessage?

---

## Question 4

When is ToolMessage used?

---

## Question 5

Draw the message flow of an AI assistant.

---

# Mini Project

## Project: Conversation Simulator

Create:

```
projects/

05-message-conversation/

```

Build a program that creates:

```
SystemMessage

        |

HumanMessage

        |

AIMessage

```

Requirements:

- Create a fake conversation
- Send the conversation to a Chat Model
- Print the response

Architecture:

```
System

   |

Human

   |

Chat Model

   |

AI Response

```

---

# Next Lesson

Continue with:

```
08-prompt-templates.md
```

Topics:

- What are Prompt Templates?
- Why prompts need templates
- Template variables
- ChatPromptTemplate
- Message placeholders
- Prompt composition
