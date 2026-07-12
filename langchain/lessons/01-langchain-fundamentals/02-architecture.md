# Lesson 02 — LangChain Architecture

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand the internal architecture of LangChain and how its components connect together to build AI applications.

After this lesson, you should understand:

- LangChain high-level architecture
- LangChain package ecosystem
- How LangChain components communicate
- Core LangChain abstractions
- Execution flow
- LCEL architecture
- Difference between LangChain and LangGraph
- Common architecture patterns

---

# 1. LangChain High-Level Architecture

LangChain sits between your application and AI providers.

High-level view:

```
                 USER

                  |

                  v

          Your Application

                  |

                  v

              LangChain

                  |

      ---------------------------

      |            |            |

   Prompts      Models      Retrieval


                  |

                  v

          Provider Integrations


      ---------------------------

      |            |            |

   OpenAI     Anthropic      Gemini


                  |

                  v

              LLM Model

```

---

# Application Layer

This is the code you write.

Examples:

- Web application
- Backend API
- Mobile application
- CLI tool

Example:

```
React Frontend

        |

        v

Node.js Backend

        |

        v

LangChain

        |

        v

OpenAI
```

---

# LangChain Layer

LangChain handles AI application logic.

It provides:

- Prompt templates
- Model interfaces
- Output parsing
- Retrieval
- Memory
- Tools
- Agents
- Workflows

---

# Provider Layer

LangChain connects to external AI providers.

Examples:

- OpenAI
- Anthropic
- Google Gemini
- Azure OpenAI
- Groq
- Ollama

Example:

```
Application

     |

LangChain

     |

OpenAI Adapter

     |

OpenAI API

```

---

# 2. LangChain Package Ecosystem

Modern LangChain is divided into multiple packages.

Architecture:

```
                    LangChain


                       |

          +------------+------------+

          |                         |

    Core Abstractions          Integrations


          |                         |

          v                         v


 @langchain/core          @langchain/community


          |

          |

          v


 Provider Packages


```

---

# @langchain/core

Package:

```
@langchain/core
```

This is the foundation of LangChain.

It contains the main abstractions:

- Runnable interface
- Messages
- Prompt templates
- Output parsers
- Callbacks
- Configuration

Think of it as the engine of LangChain.

Example:

```
Prompt

   |

Runnable

   |

Model

   |

Parser

```

---

# langchain

Package:

```
langchain
```

Provides higher-level application building blocks.

Includes:

- Chains
- Agents
- Retrievers
- Document utilities
- Application helpers

Used when building complete AI systems.

---

# @langchain/community

Package:

```
@langchain/community
```

Contains community-maintained integrations.

Examples:

- Document loaders
- Vector databases
- External tools
- Third-party integrations

Examples:

```
PDF Loader

Web Loader

Chroma

FAISS

```

---

# Provider Packages

Examples:

```
@langchain/openai

@langchain/anthropic

@langchain/google-genai

```

These packages connect LangChain to specific AI providers.

Example:

```
LangChain

     |

OpenAI Package

     |

OpenAI API

```

---

# 3. How LangChain Components Communicate

LangChain components communicate using standard interfaces.

The basic idea:

```
Input

  |

Component

  |

Output

```

Each component has:

- Input format
- Processing logic
- Output format

Example:

```
Question

   |

Prompt Template

   |

Formatted Prompt

```

---

Multiple components can be connected:

```
Prompt Template

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

Each component performs one responsibility.

---

# 4. Core LangChain Concepts

---

# 4.1 Runnables

Runnable is the most important abstraction in modern LangChain.

A Runnable represents something that can execute.

Common methods:

```
invoke()

batch()

stream()

```

Example:

```
Input

 |

Runnable

 |

Output

```

Many LangChain objects are Runnables:

- Prompt templates
- Chat models
- Output parsers
- Chains
- Retrievers

This allows everything to be connected together.

---

# 4.2 Messages

LLMs communicate using messages.

Main message types:

```
SystemMessage

HumanMessage

AIMessage

ToolMessage

```

Example:

```
System:

You are a helpful assistant.


Human:

Explain LangChain.


AI:

LangChain is a framework...

```

Messages provide structure and context.

---

# 4.3 Prompt Templates

Prompt templates create reusable prompts.

Without templates:

```
Explain Python

Explain JavaScript

Explain LangChain

```

With templates:

```
Explain {topic}

```

Example:

Input:

```
topic = LangChain

```

Output:

```
Explain LangChain

```

Benefits:

- Reusable prompts
- Dynamic inputs
- Easier maintenance

---

# 4.4 Chat Models

Chat models communicate with LLM providers.

Examples:

```
ChatOpenAI

ChatAnthropic

ChatGoogleGenerativeAI

```

Flow:

```
Messages

    |

    v

Chat Model

    |

    v

AI Message

```

---

# 4.5 Output Parsers

Models return text.

Applications usually need structured data.

Example:

Model response:

```
{
"name":"John",
"age":25
}

```

Parser converts it into usable application data.

Example:

```typescript
{
 name: "John",
 age: 25
}
```

---

# 4.6 Retrievers

Retrievers find relevant information.

Used mainly in RAG applications.

Flow:

```
User Question

      |

      v

 Retriever

      |

      v

Documents

      |

      v

   LLM

      |

      v

Answer

```

Example:

Question:

```
What is the refund policy?

```

Retriever finds:

```
refund-policy.pdf

```

The model uses this information.

---

# 5. LangChain Execution Flow

A simple LangChain application:

```
User Input

      |

      v

Prompt Template

      |

      v

Chat Model

      |

      v

Output Parser

      |

      v

Final Response

```

---

Internal execution:

```
invoke()

   |

Receive Input

   |

Validate Input

   |

Create Messages

   |

Call Model Provider

   |

Receive Response

   |

Process Output

   |

Return Result

```

---

# 6. LCEL Architecture Preview

LCEL means:

```
LangChain Expression Language
```

It allows components to be connected together.

Example:

```
Prompt

   |

   v

Model

   |

   v

Parser

```

Code:

```typescript
const chain = prompt.pipe(model).pipe(parser);
```

Architecture:

```
Runnable

    |

Runnable

    |

Runnable

```

Benefits:

- Composition
- Streaming
- Async execution
- Debugging
- Reusability

---

# 7. LangChain vs LangGraph

## LangChain

Used for:

- Components
- Chains
- RAG
- Agents
- Model workflows

Example:

```
Input

 |

Prompt

 |

Model

 |

Output

```

---

## LangGraph

Used for:

- Complex workflows
- Stateful agents
- Loops
- Human approval
- Multi-agent systems

Example:

```
             Start

               |

               v

             Agent

               |

        ----------------

        |              |

      Tool          Human

        |

        v

       Agent

```

---

## Comparison

| LangChain            | LangGraph              |
| -------------------- | ---------------------- |
| Components           | Workflow orchestration |
| Linear flows         | Graph flows            |
| Simple chains        | Complex state machines |
| RAG pipelines        | Multi-step agents      |
| Stateless by default | Stateful               |

---

# 8. LangChain Application Architecture Patterns

---

# Pattern 1 — Simple Chatbot

```
User

 |

Prompt

 |

Model

 |

Response

```

---

# Pattern 2 — RAG Application

```
User

 |

Retriever

 |

Documents

 |

Prompt

 |

Model

 |

Answer

```

---

# Pattern 3 — Agent Application

```
User

 |

Agent

 |

Tool Selection

 |

Tool Execution

 |

Final Answer

```

---

# Pattern 4 — Production AI System

```
Frontend

    |

Backend API

    |

LangChain

    |

LangGraph

    |

Tools + RAG

    |

LangSmith

```

---

# 9. Common Architecture Mistakes

---

## Mistake 1 — One Huge File

Bad:

```
app.ts

- prompts
- models
- tools
- database
- API
```

Better:

```
src/

models/

prompts/

tools/

chains/

services/

```

---

## Mistake 2 — Hardcoding Prompts

Bad:

```typescript
model.invoke("Answer this question");
```

Better:

```
Prompt Template

       |

      Model

```

---

## Mistake 3 — Building Agents Too Early

Recommended order:

```
Prompt Templates

        |

Chat Models

        |

LCEL

        |

Chains

        |

RAG

        |

Tools

        |

Agents

        |

LangGraph

```

---

# 10. Debugging Architecture Problems

When debugging:

## Step 1

Check input.

Ask:

```
What data entered this component?
```

---

## Step 2

Check output.

Ask:

```
What did this component return?
```

---

## Step 3

Test components separately.

Example:

```
Test Prompt

Test Model

Test Parser

```

---

## Step 4

Trace execution.

Later we will use:

```
LangSmith

```

to visualize:

```
Input

 |

Prompt

 |

Model

 |

Parser

 |

Output

```

---

# Exercise

Answer:

## 1.

What is the purpose of `@langchain/core`?

## 2.

What is a Runnable?

## 3.

Explain the difference between LangChain and LangGraph.

## 4.

Draw the architecture of a RAG application.

## 5.

Why are provider packages separated from LangChain core?

---

# Mini Project

## AI Assistant Architecture Design

Design the architecture for:

```
Personal AI Assistant
```

Include:

```
User

 |

Backend

 |

LangChain

 |

Prompt

 |

Chat Model

 |

Memory

 |

Tools

 |

Response

```

Save your diagram:

```
assets/diagrams/personal-ai-assistant.png
```

---

# Next Lesson

Continue with:

```
03-installation.md
```

Topics:

- Node.js setup
- TypeScript setup
- Installing LangChain packages
- Environment variables
- Project structure
- First LangChain application
