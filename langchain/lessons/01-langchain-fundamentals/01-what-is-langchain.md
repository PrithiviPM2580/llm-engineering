# Lesson 01 — What is LangChain?

## Level

Level 1 — LangChain Fundamentals

## Goal

Understand what LangChain is, why it exists, and where it fits when building AI applications.

---

# Learning Objectives

After this lesson you should understand:

- What LangChain is
- Why LangChain was created
- Problems LangChain solves
- LangChain architecture at a high level
- When to use LangChain
- When not to use LangChain
- How LangChain fits with LLM providers

---

# 1. What is LangChain?

LangChain is a framework for building applications powered by Large Language Models (LLMs).

It provides reusable components for:

- Prompt management
- Model integration
- Output parsing
- Document processing
- Retrieval
- Memory
- Tools
- Agents
- Workflows

LangChain does not replace an LLM.

It connects application logic with LLM providers.

---

# 2. The Problem Before LangChain

A simple AI application:

```
User
 |
 |
 v
Application
 |
 |
 v
LLM API
 |
 |
 v
Response
```

This works for simple applications.

Example:

```
User:
Explain JavaScript

Application:
Send request

LLM:
Return answer
```

---

## The Problem Appears When Applications Grow

Real applications need:

- Conversation history
- Documents
- Search
- Databases
- External APIs
- Multiple models
- Structured outputs
- Tool usage

The architecture becomes:

```
                 User

                  |

                  v

          Application Backend

                  |

     ----------------------------

     |            |             |

  Memory     Documents       Tools

     |            |             |

     v            v             v

 Conversation   Vector      APIs

 History        Store

                  |

                  v

              LLM Model

                  |

                  v

              Final Answer
```

Managing this manually becomes difficult.

---

# 3. Why LangChain Exists

LangChain provides standard building blocks.

Instead of writing everything yourself:

```
Prompt Builder

+

API Calls

+

Parsing

+

Memory

+

Retrieval

+

Tools

```

LangChain provides reusable components:

```
Prompt Template

+

Chat Model

+

Output Parser

+

Retriever

+

Tool

+

Agent
```

---

# 4. LangChain Mental Model

Think of LangChain as LEGO blocks.

Each component has a specific responsibility.

Example:

```
Prompt

   |

   v

Chat Model

   |

   v

Output Parser

   |

   v

Application
```

Each block can be replaced.

Example:

Change model:

```
OpenAI

      |
      v

Claude

      |
      v

Gemini
```

Your application structure remains similar.

---

# 5. LangChain Ecosystem

High-level architecture:

```
                 Application

                      |

                      v

                 LangChain

        ----------------------------

        |             |            |

     Prompts       Models      Retrieval

        |             |            |

        |             |            |

        v             v            v


   Templates      OpenAI      Vector DB

                  Claude

                  Gemini

```

---

# 6. Main LangChain Components

## Chat Models

Responsible for communicating with LLM providers.

Examples:

- OpenAI
- Anthropic
- Google Gemini

---

## Prompt Templates

Reusable prompts.

Example:

Instead of:

```
Explain Python
```

Use:

```
Explain {topic}
```

---

## Output Parsers

Convert model responses.

Example:

LLM returns:

```
{name:"John"}
```

Parser converts:

```typescript
{
  name: "John";
}
```

---

## Retrievers

Find relevant information.

Example:

```
Question

   |

Retriever

   |

Relevant Documents

```

---

## Tools

Allow models to interact with external systems.

Examples:

- APIs
- Databases
- Search engines

---

## Agents

Allow models to decide:

```
Question

 |

Agent

 |

Choose Tool

 |

Execute

 |

Answer
```

---

# 7. When Should You Use LangChain?

Use LangChain when building:

## Chatbots

Example:

Customer support assistant

```
User

 |

LangChain

 |

Company Knowledge Base

 |

Answer
```

---

## RAG Applications

Example:

Chat with PDFs.

```
PDF

 |

Embeddings

 |

Vector Database

 |

Retriever

 |

LLM

```

---

## AI Agents

Example:

Travel planner.

```
User

 |

Agent

 |

Search Tool

 |

Booking Tool

 |

Answer
```

---

# 8. When Should You NOT Use LangChain?

Simple applications:

```
User

 |

OpenAI API

 |

Response
```

For this, the provider SDK may be enough.

Example:

```typescript
const response = await openai.responses.create({
  model: "gpt-4.1-mini",
  input: "Hello",
});
```

Adding LangChain may add unnecessary abstraction.

---

# 9. Internal Flow

When you call LangChain:

```
Your Code

   |

   v

LangChain Component

   |

   v

Provider Adapter

   |

   v

OpenAI / Claude / Gemini API

   |

   v

Response

   |

   v

LangChain Object

   |

   v

Your Application

```

---

# 10. Important Concepts To Remember

## LangChain is not:

❌ An AI model

❌ A replacement for OpenAI

❌ A database

❌ A chatbot

## LangChain is:

✅ An orchestration framework

✅ A collection of reusable components

✅ A way to compose AI workflows

---

# Common Mistakes

## Mistake 1

Thinking:

"LangChain creates intelligence"

Reality:

The model creates intelligence.

LangChain organizes the workflow.

---

## Mistake 2

Using LangChain everywhere.

Simple tasks may not need it.

---

## Mistake 3

Learning LangChain without understanding components.

Always understand:

Input → Processing → Output

---

# Debugging Tips

When something breaks:

Ask:

1. Did the prompt produce the expected input?
2. Did the model receive the correct messages?
3. Did the parser handle the output?
4. Did retrieval return useful information?

Break the pipeline into smaller pieces.

---

# Best Practices

- Keep prompts separate from code
- Build reusable components
- Start simple
- Add complexity only when needed
- Understand the execution flow

---

# Exercise

Answer:

## Question 1

What problem does LangChain solve?

---

## Question 2

Is LangChain an AI model?

Explain.

---

## Question 3

When would you use LangChain instead of directly calling OpenAI?

---

## Question 4

Draw the architecture of a PDF chatbot.

---

## Question 5

Explain the difference between:

```
OpenAI SDK
```

and

```
LangChain
```

---

# Mini Project

## AI Application Architecture Design

Create a diagram for:

"Company Knowledge Assistant"

Include:

```
User

↓

Backend

↓

LangChain

↓

Retriever

↓

Vector Database

↓

Chat Model

↓

Answer
```

Save your diagram as:

```
assets/diagrams/company-assistant.png
```

---

# Next Lesson

After completing this lesson:

Move to:

```
02-architecture.md
```

Topic:

LangChain Internal Architecture

You will learn:

- Core package design
- langchain-core
- integrations
- runnables
- execution flow
- component communication
