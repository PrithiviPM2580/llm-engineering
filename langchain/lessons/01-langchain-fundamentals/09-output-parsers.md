# Lesson 09 — Output Parsers

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand how LangChain converts raw AI model responses into structured, usable application data.

By the end of this lesson, you should understand:

- Why output parsing exists
- Model output problems
- Output Parser architecture
- StringOutputParser
- StructuredOutputParser
- JSON parsing
- Zod schema validation
- Output parsers with LCEL
- Debugging parser issues
- Best practices

---

# 1. What Are Output Parsers?

An Output Parser converts model output into a format your application can use.

Basic model flow:

```
User

 |

Prompt

 |

Chat Model

 |

AI Response

```

The problem:

Models usually return text.

Example:

```
The user is John and he is 25 years old.

```

But applications need:

```json
{
  "name": "John",
  "age": 25
}
```

Output Parsers solve this problem.

---

# 2. Why Do Output Parsers Exist?

Without parsers:

```
AI Response

        |

        v

String

```

Your application must manually process it.

Example:

```typescript
const text = response.content;
```

Problems:

- Hard to validate
- Hard to maintain
- Error-prone
- Different formats

---

# Parser Solution

```
AI Response

       |

       v

Output Parser

       |

       v

Structured Data

```

---

# 3. Output Parser Architecture

```
              Application


                   |

                   v


              Output Parser


                   |

                   v


              Chat Model


                   |

                   v


             AI Generated Text

```

---

# 4. Output Parsers Are Runnables

Output parsers follow the Runnable interface.

They support:

```
invoke()

batch()

stream()

```

This means:

```
Prompt

 |

Model

 |

Parser

```

can be connected using LCEL.

---

# 5. StringOutputParser

The simplest parser.

It converts model output into a normal string.

---

# Import

```typescript
import { StringOutputParser } from "@langchain/core/output_parsers";
```

---

# Example

```typescript
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";

import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
});

const parser = new StringOutputParser();

const chain = model.pipe(parser);

const response = await chain.invoke("Explain LangChain");

console.log(response);
```

---

# Execution Flow

```
Prompt

 |

Chat Model

 |

AIMessage

 |

StringOutputParser

 |

String

```

---

# Why Use StringOutputParser?

Because Chat Models return:

```
AIMessage

```

but your application may only need:

```
string

```

---

# 6. Structured Output

Real applications need structured data.

Examples:

## User Profile

```json
{
  "name": "Alex",
  "age": 30
}
```

---

## Product Information

```json
{
  "title": "Laptop",
  "price": 1200
}
```

---

## API Response

```json
{
  "answer": "...",
  "sources": []
}
```

---

# 7. StructuredOutputParser

LangChain provides:

```
StructuredOutputParser

```

It helps create structured responses.

---

# Install Zod

```bash
npm install zod
```

Zod validates data structures.

---

# Example Schema

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),

  age: z.number(),
});
```

---

# 8. With Chat Model

Example:

```typescript
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
});

const structuredModel = model.withStructuredOutput({
  name: "string",

  age: "number",
});

const result = await structuredModel.invoke("Create a user profile for John");

console.log(result);
```

---

# Output

Instead of:

```
John is 25 years old.

```

You get:

```json
{
  "name": "John",
  "age": 25
}
```

---

# 9. Zod Structured Output

Production applications usually use schemas.

Example:

```typescript
import { z } from "zod";

const Person = z.object({
  name: z.string(),

  age: z.number(),

  occupation: z.string(),
});

const modelWithSchema = model.withStructuredOutput(Person);
```

---

# Why Use Zod?

Because it provides:

- Validation
- Type safety
- Clear structure
- Error detection

---

# 10. Output Parser With LCEL

Complete pipeline:

```
User Input

    |

Prompt Template

    |

Chat Model

    |

Output Parser

    |

Application Data

```

Example:

```typescript
const chain = prompt.pipe(model).pipe(parser);

const result = await chain.invoke({
  topic: "LangChain",
});
```

---

# 11. Complete Example

```typescript
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate } from "@langchain/core/prompts";

import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0,
});

const prompt = ChatPromptTemplate.fromTemplate("Explain {topic}");

const parser = new StringOutputParser();

const chain = prompt.pipe(model).pipe(parser);

const answer = await chain.invoke({
  topic: "RAG",
});

console.log(answer);
```

---

# Code Flow

```
Input

{
topic:"RAG"
}

 |

Prompt

 |

Formatted Message

 |

Chat Model

 |

AIMessage

 |

String Parser

 |

String

```

---

# 12. Common Output Parser Types

LangChain includes different parsers.

---

# StringOutputParser

Returns:

```
string

```

Use for:

- Chat responses
- Simple text

---

# Structured Output Parser

Returns:

```
object

```

Use for:

- APIs
- Database operations
- Applications

---

# JSON Parser

Returns:

```
JSON object

```

Use for:

- Machine-readable responses

---

# Pydantic/Zod Style Parsers

Validate:

```
Schema

+

Output

```

---

# 13. Common Mistakes

---

## Mistake 1

Trusting model output.

Bad:

```typescript
JSON.parse(response);
```

without validation.

Models can return invalid JSON.

---

## Mistake 2

Using text parsing everywhere.

Bad:

```
Split string manually

```

Better:

```
Structured Output

```

---

## Mistake 3

Schema mismatch.

Example:

Schema:

```typescript
age: number;
```

Model:

```json
{
  "age": "twenty"
}
```

Validation fails.

---

# 14. Debugging Output Parsers

## Step 1

Inspect raw response.

```typescript
console.log(response);
```

---

## Step 2

Check parser input.

```
Does parser receive AIMessage?

```

---

## Step 3

Check schema.

Verify:

```
Expected fields

Actual fields

```

---

## Step 4

Test parser separately.

```
AI Response

↓

Parser

↓

Result

```

---

# 15. Best Practices

- Use structured output for production systems
- Validate important data
- Keep schemas simple
- Use Zod for TypeScript applications
- Do not rely on prompt instructions alone
- Combine parsers with LCEL

---

# Exercise

Answer:

## Question 1

Why do we need Output Parsers?

---

## Question 2

What does StringOutputParser return?

---

## Question 3

Why is structured output important?

---

## Question 4

What problem does Zod solve?

---

## Question 5

Draw:

```
Prompt

↓

Model

↓

Parser

↓

Application Data

```

---

# Mini Project

## Project: AI Data Extractor

Create:

```
projects/

07-ai-data-extractor/

```

Build an application that extracts:

Input:

```
John is a software engineer with 5 years experience.

```

Output:

```json
{
  "name": "John",
  "job": "software engineer",
  "experience": 5
}
```

Requirements:

Use:

- Chat Model
- Zod schema
- Structured output
- LCEL pipeline

Architecture:

```
Text

 |

Prompt

 |

Chat Model

 |

Output Parser

 |

JSON Data

```

---

# Next Lesson

Continue with:

```
10-lcel.md
```

Topics:

- What is LCEL?
- Why LCEL exists
- Pipe operator
- Runnable composition
- LCEL execution model
- Streaming
- Async execution
- Debugging LCEL chains
