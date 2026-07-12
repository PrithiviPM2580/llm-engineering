# Lesson 08 — Prompt Templates

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand how LangChain manages prompts using reusable templates and how prompt templates connect users, applications, and Chat Models.

By the end of this lesson, you should understand:

- What Prompt Templates are
- Why Prompt Templates exist
- Static vs dynamic prompts
- Template variables
- PromptTemplate
- ChatPromptTemplate
- Message placeholders
- Prompt execution flow
- Best practices

---

# 1. What is a Prompt?

A prompt is the instruction given to an AI model.

Example:

```
Explain LangChain
```

The model receives the prompt and generates a response.

Basic flow:

```
User Input

    |

    v

Prompt

    |

    v

AI Model

    |

    v

Response

```

---

# 2. The Problem With Hardcoded Prompts

A beginner approach:

```typescript
const response = await model.invoke("Explain LangChain");
```

This works.

But imagine building:

- Chatbots
- RAG systems
- Agents
- Production applications

You will have hundreds of prompts.

Example:

```
Explain JavaScript

Explain TypeScript

Explain LangChain

Explain React

```

The prompt logic becomes difficult to maintain.

---

# Prompt Template Solution

LangChain provides reusable templates.

Instead of:

```
Explain LangChain

```

Create:

```
Explain {topic}

```

Now the same prompt works for:

```
topic = LangChain

topic = RAG

topic = Agents

```

---

# 3. Why Prompt Templates Exist

Prompt Templates provide:

## Reusability

One template:

```
Explain {topic}

```

Many inputs:

```
LangChain

RAG

Agents

```

---

## Maintainability

Change one template instead of many files.

---

## Dynamic Applications

User input can fill variables.

Example:

```
User:

Explain {technology}

```

Input:

```
technology = LangGraph

```

---

# 4. Prompt Template Architecture

Flow:

```
Application

     |

     v

Prompt Template

     |

     v

Formatted Prompt

     |

     v

Chat Model

     |

     v

Response

```

---

# 5. PromptTemplate

`PromptTemplate` creates normal text prompts.

Import:

```typescript
import { PromptTemplate } from "@langchain/core/prompts";
```

---

Example:

```typescript
const prompt = new PromptTemplate({
  template: "Explain {topic}",

  inputVariables: ["topic"],
});
```

---

# Code Explanation

## Create Template

```typescript
new PromptTemplate();
```

Creates a reusable prompt.

---

## Template

```typescript
template: "Explain {topic}";
```

Defines the prompt structure.

---

## Variables

```typescript
inputVariables: ["topic"];
```

Defines required inputs.

---

# 6. Formatting A Prompt

Example:

```typescript
const result = await prompt.format({
  topic: "LangChain",
});

console.log(result);
```

Output:

```
Explain LangChain

```

---

# Execution:

```
Input

{
 topic:"LangChain"
}


        |

        v


Prompt Template


        |

        v


Explain LangChain

```

---

# 7. Connecting Prompt With Model

Prompt Templates are Runnables.

Therefore:

```
Prompt

 |

Model

```

Example:

```typescript
const chain = prompt.pipe(model);

const response = await chain.invoke({
  topic: "LangChain",
});

console.log(response.content);
```

---

# Architecture:

```
Input Object

{
 topic:"LangChain"
}


        |

        v


Prompt Runnable


        |

        v


Chat Model Runnable


        |

        v


AI Message

```

---

# 8. ChatPromptTemplate

Chat models work with messages.

For chat applications we use:

```
ChatPromptTemplate

```

It creates:

- SystemMessage
- HumanMessage
- AIMessage

automatically.

---

# Example

Import:

```typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";
```

---

Create:

```typescript
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful {role}"],

  ["human", "Explain {topic}"],
]);
```

---

# Result

Input:

```typescript
{
 role:"teacher",
 topic:"LangChain"
}
```

Creates:

```
SystemMessage:

You are a helpful teacher


HumanMessage:

Explain LangChain

```

---

# 9. ChatPromptTemplate Flow

```
Variables

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

AI Response

```

---

# 10. Message Placeholder

Sometimes conversations are dynamic.

Example:

```
System

Human

Previous Messages

Human

```

We use:

```
MessagesPlaceholder

```

---

Example:

```typescript
import { MessagesPlaceholder } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are helpful"],

  new MessagesPlaceholder("history"),

  ["human", "{input}"],
]);
```

---

# What Happens?

Input:

```typescript
{
 history:[
  previous messages
 ],

 input:
 "Explain RAG"
}
```

Output:

```
SystemMessage

Previous Conversation

HumanMessage

```

---

# 11. Complete Example

```typescript
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are an expert {field} teacher"],

  ["human", "Explain {topic}"],
]);

const chain = prompt.pipe(model);

const response = await chain.invoke({
  field: "programming",

  topic: "LangChain",
});

console.log(response.content);
```

---

# Execution Flow

```
Input

{
 field:"programming",
 topic:"LangChain"
}


        |

        v


ChatPromptTemplate


        |

        v


SystemMessage

HumanMessage


        |

        v


Chat Model


        |

        v


AIMessage

```

---

# 12. Prompt Templates and Runnable

Prompt templates are Runnables.

Meaning:

They support:

```
invoke()

batch()

stream()

```

Example:

```typescript
const messages = await prompt.invoke({
  topic: "RAG",
});
```

---

# 13. Common Mistakes

---

## Mistake 1

Hardcoding prompts everywhere.

Bad:

```typescript
model.invoke("Explain RAG");
```

Better:

```
Prompt Template

        |

       Model

```

---

## Mistake 2

Forgetting variables.

Template:

```
Explain {topic}

```

Input:

```
{}

```

Error:

```
Missing variable topic

```

---

## Mistake 3

Using PromptTemplate with chat models.

For conversations:

Use:

```
ChatPromptTemplate

```

---

# 14. Debugging Prompt Problems

## Print formatted prompt

Example:

```typescript
console.log(
  await prompt.format({
    topic: "LangChain",
  }),
);
```

---

## Check variables

Verify:

```
inputVariables

```

matches:

```
invoke()

```

---

## Inspect messages

For chat prompts:

```typescript
console.log(await prompt.invoke(data));
```

---

# 15. Best Practices

- Keep prompts separate from business logic
- Use meaningful variable names
- Version important prompts
- Keep system instructions clear
- Avoid extremely long prompts
- Test prompts independently

---

# Exercise

Answer:

## Question 1

Why do Prompt Templates exist?

---

## Question 2

What is the difference between:

```
PromptTemplate

vs

ChatPromptTemplate

```

---

## Question 3

What happens when:

```
Explain {topic}

```

receives:

```
topic = RAG

```

---

## Question 4

Why are Prompt Templates considered Runnables?

---

## Question 5

Draw:

```
Input

↓

Prompt Template

↓

Chat Model

↓

Response

```

---

# Mini Project

## Project: Prompt Playground

Create:

```
projects/

06-prompt-playground/

```

Build a prompt system that supports:

```
Role

Topic

Difficulty

Style

```

Example:

Input:

```json
{
  "role": "teacher",
  "topic": "LangChain",
  "difficulty": "beginner",
  "style": "simple"
}
```

Output prompt:

```
You are a teacher.

Explain LangChain.

Level: beginner.

Style: simple.

```

Requirements:

Use:

- ChatPromptTemplate
- Variables
- Runnable pipe
- Chat Model

Architecture:

```
User Input

    |

Prompt Template

    |

Chat Model

    |

Response

```

---

# Next Lesson

Continue with:

```
09-output-parsers.md
```

Topics:

- Why output parsing exists
- StringOutputParser
- StructuredOutputParser
- JSON parsing
- Zod schemas
- Model output validation
