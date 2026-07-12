# Level 1 — LangChain Fundamentals Exercises

## Module

01-langchain-fundamentals

---

# Purpose

These exercises test your understanding of:

- LangChain architecture
- Packages
- Runnables
- Chat Models
- Messages
- Prompt Templates
- Output Parsers
- LCEL
- RunnableSequence
- RunnableLambda
- RunnableParallel
- RunnablePassthrough

Complete these before moving to Level 2.

---

# Exercise 1 — LangChain Architecture Diagram

## Task

Draw the architecture of a simple LangChain application.

Your diagram must include:

- User input
- Prompt Template
- Chat Model
- Output Parser
- Final response

Expected format:

```
User

 |

Prompt

 |

Chat Model

 |

Parser

 |

Output

```

---

# Exercise 2 — Package Understanding

## Question

Explain the purpose of each package:

```
@langchain/core

langchain

@langchain/community

@langchain/openai

```

Write:

- What it contains
- When you use it
- Example component from that package

---

# Exercise 3 — Runnable Basics

## Task

Create a RunnableLambda that:

Input:

```
"langchain"

```

Output:

```
"LANGCHAIN"

```

Requirements:

Use:

- RunnableLambda
- invoke()

---

# Exercise 4 — Runnable Pipeline

Create this pipeline:

```
Input Text

↓

RunnableLambda

(convert lowercase)

↓

RunnableLambda

(add prefix)

↓

Output

```

Example:

Input:

```
LANGCHAIN

```

Output:

```
Topic: langchain

```

---

# Exercise 5 — Chat Model Practice

Create a ChatOpenAI instance.

Requirements:

- Use environment variables
- Set temperature
- Call invoke()

Ask:

```
Explain LangChain in simple words

```

Print:

```
AI response content

```

---

# Exercise 6 — Messages

Create a conversation using:

- SystemMessage
- HumanMessage
- AIMessage

Example:

```
System:

You are a programming teacher.


Human:

Explain TypeScript.


AI:

TypeScript is...

```

Print the message array.

---

# Exercise 7 — Prompt Template

Create:

```
Explain {topic}

```

Input:

```json
{
  "topic": "RAG"
}
```

Expected output:

```
Explain RAG

```

---

# Exercise 8 — ChatPromptTemplate

Create a chat prompt:

System:

```
You are a {role}

```

Human:

```
Explain {topic}

```

Input:

```json
{
  "role": "teacher",
  "topic": "LangChain"
}
```

Verify generated messages.

---

# Exercise 9 — Output Parser

Create a chain:

```
Prompt

↓

Chat Model

↓

StringOutputParser

```

Input:

```
Explain embeddings

```

Return:

```
string response

```

---

# Exercise 10 — Structured Output

Create a schema:

```json
{
  "name": "",
  "age": 0,
  "job": ""
}
```

Ask the model:

```
Create a user profile for John

```

Return structured JSON.

---

# Exercise 11 — LCEL Chain

Create:

```
Prompt

↓

Model

↓

Parser

```

using:

```typescript
.pipe()
```

Do not manually call each component.

---

# Exercise 12 — RunnableSequence

Create:

```
Step 1

Convert text uppercase


Step 2

Add prefix


Step 3

Return result

```

Input:

```
langchain

```

Output:

```
Framework: LANGCHAIN

```

---

# Exercise 13 — RunnableLambda Data Transformation

Input:

```json
{
  "name": "Alex",
  "skill": "TypeScript"
}
```

Create RunnableLambda that returns:

```json
{
  "message": "Alex knows TypeScript"
}
```

---

# Exercise 14 — RunnableParallel

Create two parallel operations.

Input:

```
LangChain

```

Task 1:

```
Convert uppercase

```

Task 2:

```
Count characters

```

Expected output:

```json
{
  "uppercase": "",
  "length": 0
}
```

---

# Exercise 15 — RunnablePassthrough

Create a pipeline where:

Input:

```json
{
  "question": "What is RAG?"
}
```

Output:

```json
{
  "question": "What is RAG?",
  "context": "Retrieved documents"
}
```

Use:

- RunnableParallel
- RunnablePassthrough

---

# Exercise 16 — Mini LCEL Application

Build:

```
User Question

↓

Prompt Template

↓

Chat Model

↓

Output Parser

↓

Final Answer

```

Requirements:

- LCEL
- Runnable composition
- Parser

---

# Exercise 17 — Debugging Challenge

This code fails:

```typescript
const chain = prompt.pipe(parser).pipe(model);
```

Explain:

- Why does it fail?
- What is the correct order?

---

# Exercise 18 — Architecture Design

Design a LangChain chatbot.

Include:

- Components
- Data flow
- Input/output of each component

Example:

```
User

↓

Messages

↓

Prompt

↓

Model

↓

Parser

↓

Response

```

---

# Exercise 19 — Production Thinking

Answer:

Why should you avoid:

```
One huge chain

```

and prefer:

```
Small reusable Runnables

```

---

# Exercise 20 — Final Level 1 Project

## Project: AI Chatbot Foundation

Build:

```
AI Chatbot

```

Architecture:

```
User

 |

Message

 |

ChatPromptTemplate

 |

Chat Model

 |

Output Parser

 |

Response

```

Requirements:

Must include:

✅ Chat Model  
✅ Messages  
✅ Prompt Template  
✅ Output Parser  
✅ LCEL  
✅ Runnable composition

Features:

- User asks questions
- AI responds
- Responses are parsed
- Clean project structure

---

# Level 1 Completion Checklist

Before moving forward verify:

## Concepts

[ ] I understand LangChain architecture

[ ] I understand Runnables

[ ] I understand Messages

[ ] I understand Chat Models

[ ] I understand Prompt Templates

[ ] I understand Output Parsers

[ ] I understand LCEL

[ ] I understand RunnableSequence

[ ] I understand RunnableLambda

[ ] I understand RunnableParallel

[ ] I understand RunnablePassthrough

## Coding

[ ] I built a basic chatbot

[ ] I created LCEL pipelines

[ ] I transformed data with Runnables

[ ] I used structured outputs

---

# Next Module

After completing these exercises:

```
02-building-chains/

```

Start:

```
01-lcel-deep-dive.md

```
