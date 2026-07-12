# Lesson 10 — LCEL (LangChain Expression Language)

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand LCEL, the modern way of building LangChain applications by connecting Runnables together.

By the end of this lesson, you should understand:

- What LCEL is
- Why LCEL exists
- Pipe operator
- Runnable composition
- LCEL execution model
- Benefits of LCEL
- Streaming support
- Async execution
- Debugging LCEL pipelines
- Best practices

---

# 1. What is LCEL?

LCEL stands for:

```
LangChain Expression Language
```

LCEL is a declarative way to compose LangChain components.

Simple definition:

```
LCEL = Connecting Runnables together to create workflows
```

Example:

```
Prompt

 |

Model

 |

Parser

```

becomes:

```typescript
const chain = prompt.pipe(model).pipe(parser);
```

---

# 2. Why Was LCEL Created?

Before LCEL, developers created chains using different classes.

Example:

```
LLMChain

SequentialChain

ConversationChain

```

Problems:

- Different APIs
- Hard composition
- Limited streaming
- Difficult async support
- Less flexible

---

# LCEL Solution

Everything becomes a Runnable.

```
Prompt

|

Model

|

Parser

```

All components follow:

```
invoke()

batch()

stream()

```

---

# 3. LCEL Architecture

High-level:

```
                 LCEL Chain


                      |

        --------------------------------


        |              |               |


     Prompt          Model          Parser


        |              |               |


        --------------------------------


                      |

                      v


                 Final Output

```

---

# 4. LCEL Mental Model

Think of LCEL as a pipeline.

Example:

```
Input

 |

Step 1

 |

Step 2

 |

Step 3

 |

Output

```

Like Unix pipes:

```
command1 | command2 | command3

```

LangChain:

```
prompt | model | parser

```

---

# 5. The Pipe Operator

The pipe operator:

```typescript
.pipe()
```

connects Runnables.

Example:

```typescript
const chain = prompt.pipe(model).pipe(parser);
```

Meaning:

```
Output of prompt

        |

        v

Input of model

        |

        v

Input of parser

```

---

# 6. First LCEL Example

```typescript
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate } from "@langchain/core/prompts";

import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
});

const prompt = ChatPromptTemplate.fromTemplate("Explain {topic}");

const parser = new StringOutputParser();

const chain = prompt.pipe(model).pipe(parser);

const result = await chain.invoke({
  topic: "LangChain",
});

console.log(result);
```

---

# 7. Execution Flow

Input:

```json
{
  "topic": "LangChain"
}
```

Flow:

```
Input Object

     |

     v

ChatPromptTemplate


     |

     v


Messages


     |

     v


Chat Model


     |

     v


AIMessage


     |

     v


StringOutputParser


     |

     v


String

```

---

# 8. LCEL and Runnable Interface

LCEL works because every component is a Runnable.

Example:

```
ChatPromptTemplate

        is a

      Runnable


ChatOpenAI

        is a

      Runnable


Parser

        is a

      Runnable

```

Therefore:

```
Runnable

+

Runnable

+

Runnable

=

LCEL Chain

```

---

# 9. LCEL Supports Streaming

One major advantage of LCEL:

Streaming works automatically.

Without LCEL:

```
Build custom streaming logic

```

With LCEL:

```
Chain

 |

stream()

```

Example:

```typescript
const stream = await chain.stream({
  topic: "AI",
});

for await (const chunk of stream) {
  console.log(chunk);
}
```

---

# 10. LCEL Async Execution

LCEL is designed for async applications.

Example:

```typescript
const result = await chain.invoke(input);
```

Works naturally with:

- APIs
- Web servers
- Chat applications

---

# 11. LCEL Batch Processing

Multiple inputs:

```typescript
const results = await chain.batch([
  {
    topic: "RAG",
  },

  {
    topic: "Agents",
  },
]);
```

Flow:

```
Input 1

Input 2

Input 3


      |

    batch()


      |

Output 1

Output 2

Output 3

```

---

# 12. LCEL Internal Execution

When you run:

```typescript
chain.invoke(input);
```

Internally:

```
invoke()

   |

RunnableSequence

   |

Execute Step 1

   |

Pass Output

   |

Execute Step 2

   |

Pass Output

   |

Execute Step 3

   |

Return Result

```

---

# 13. RunnableSequence

When you connect:

```typescript
A.pipe(B).pipe(C);
```

LangChain creates:

```
RunnableSequence

```

Example:

```
RunnableSequence

        |

 -------------------

 |        |          |

Prompt  Model    Parser

```

We will study this deeply in the next lesson.

---

# 14. LCEL vs Traditional Chains

## Traditional Chain

Example:

```
LLMChain

SequentialChain

```

Problems:

- Less flexible
- More classes
- Harder composition

---

## LCEL

Advantages:

- Simple syntax
- Everything is Runnable
- Streaming
- Async
- Parallel execution
- Easier debugging

---

# Comparison

| Traditional Chains  | LCEL               |
| ------------------- | ------------------ |
| Class based         | Runnable based     |
| More configuration  | Simple composition |
| Limited flexibility | Highly composable  |
| Older style         | Modern LangChain   |

---

# 15. LCEL Application Patterns

---

# Pattern 1: Basic Chain

```
Prompt

 |

Model

 |

Parser

```

---

# Pattern 2: RAG Chain

```
Question

 |

Retriever

 |

Documents

 |

Prompt

 |

Model

 |

Parser

```

---

# Pattern 3: Agent Workflow

```
Input

 |

Agent

 |

Tools

 |

Model

 |

Response

```

---

# 16. Common Mistakes

---

## Mistake 1

Mixing old chain syntax with LCEL.

Avoid:

```
LLMChain

+

.pipe()

```

Use one style.

---

## Mistake 2

Connecting incompatible components.

Example:

```
Parser Output

does not match

Next Input

```

---

## Mistake 3

Making one giant chain.

Bad:

```
50 steps in one chain

```

Better:

```
Small reusable components

```

---

# 17. Debugging LCEL

## Check each step

Instead of:

```
Prompt -> Model -> Parser

```

test:

```
Prompt.invoke()

Model.invoke()

Parser.invoke()

```

---

## Inspect intermediate values

Example:

```typescript
const promptValue = await prompt.invoke({
  topic: "RAG",
});

console.log(promptValue);
```

---

## Check input/output types

Ask:

```
What does this Runnable receive?

What does it return?

```

---

# 18. Best Practices

- Build small Runnable components
- Use LCEL instead of manual orchestration
- Keep prompts separate
- Add parsers at the end
- Stream responses for chat apps
- Use batch for multiple tasks

---

# Exercise

Answer:

## Question 1

What does LCEL stand for?

---

## Question 2

Why was LCEL created?

---

## Question 3

Explain:

```typescript
prompt.pipe(model).pipe(parser);
```

---

## Question 4

Why does LCEL support streaming automatically?

---

## Question 5

What is RunnableSequence?

---

# Mini Project

## Project: AI Explanation Pipeline

Create:

```
projects/

08-lcel-explainer/

```

Build:

```
User Topic

 |

Prompt Template

 |

Chat Model

 |

Output Parser

 |

Answer

```

Requirements:

Use:

- ChatPromptTemplate
- ChatOpenAI
- StringOutputParser
- LCEL pipe composition

Example:

Input:

```
topic = "Vector Database"

```

Output:

```
A simple explanation of Vector Databases
```

---

# Next Lesson

Continue with:

```
11-runnable-sequence.md
```

Topics:

- RunnableSequence
- Internal architecture
- Multi-step execution
- Creating sequences manually
- Debugging sequences
- Production patterns
