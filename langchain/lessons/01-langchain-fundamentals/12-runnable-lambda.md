# Lesson 12 — RunnableLambda

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand how to add custom TypeScript logic inside LangChain pipelines using RunnableLambda.

By the end of this lesson, you should understand:

- What RunnableLambda is
- Why RunnableLambda exists
- How to wrap normal functions as Runnables
- Data transformation inside LCEL
- Where RunnableLambda fits
- Real-world use cases
- Debugging custom logic
- Best practices

---

# 1. What is RunnableLambda?

RunnableLambda allows you to convert a normal function into a LangChain Runnable.

Simple definition:

```
RunnableLambda = Your custom code + Runnable interface
```

Example:

Normal function:

```typescript
function formatName(name: string) {
  return name.toUpperCase();
}
```

RunnableLambda:

```typescript
new RunnableLambda({
  func: formatName,
});
```

Now your function supports:

```
invoke()

batch()

stream()

```

---

# 2. Why Does RunnableLambda Exist?

LangChain applications are not only:

```
Prompt

↓

Model

↓

Parser

```

Real applications need custom logic.

Examples:

- Format user input
- Clean documents
- Validate data
- Add metadata
- Transform responses
- Calculate values

---

# Without RunnableLambda

You might write:

```typescript
const input = cleanData(userInput);

const result = await model.invoke(input);
```

The custom logic sits outside the chain.

---

# With RunnableLambda

Everything becomes one pipeline:

```
User Input

 |

RunnableLambda

 |

Prompt

 |

Model

 |

Parser

```

---

# 3. RunnableLambda Architecture

```
                 LCEL Pipeline


                      |

                      v


              RunnableLambda


                      |

                      v


             Custom Function


                      |

                      v


              Transformed Data

```

---

# 4. Creating RunnableLambda

Import:

```typescript
import { RunnableLambda } from "@langchain/core/runnables";
```

---

Example:

```typescript
const uppercase = new RunnableLambda({
  func: (input: string) => {
    return input.toUpperCase();
  },
});
```

---

# Execution:

Input:

```
hello langchain
```

Output:

```
HELLO LANGCHAIN

```

---

# 5. Using invoke()

RunnableLambda works like every Runnable.

Example:

```typescript
const result = await uppercase.invoke("hello");

console.log(result);
```

Output:

```
HELLO

```

---

# 6. RunnableLambda Inside LCEL

The real power is composition.

Example:

```
Input

 |

RunnableLambda

 |

Prompt

 |

Model

 |

Parser

```

---

Example:

```typescript
const chain = uppercase.pipe(prompt).pipe(model).pipe(parser);
```

---

# 7. Complete Example

```typescript
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate } from "@langchain/core/prompts";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { RunnableLambda } from "@langchain/core/runnables";

const formatter = new RunnableLambda({
  func: (input: string) => {
    return input.trim();
  },
});

const prompt = ChatPromptTemplate.fromTemplate("Explain this topic: {topic}");

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
});

const parser = new StringOutputParser();

const chain = formatter.pipe(prompt).pipe(model).pipe(parser);

const result = await chain.invoke("   LangChain   ");

console.log(result);
```

---

# Flow Explanation

Input:

```
"   LangChain   "

```

---

RunnableLambda:

```
"LangChain"

```

---

Prompt:

```
Explain this topic: LangChain

```

---

Model:

```
AIMessage

```

---

Parser:

```
String

```

---

# 8. RunnableLambda With Objects

RunnableLambda can transform objects.

Example:

Input:

```typescript
{
 name:"Alex",
 age:25
}
```

Transform:

```typescript
const userFormatter = new RunnableLambda({
  func: (input) => {
    return {
      message: `Hello ${input.name}`,
    };
  },
});
```

Output:

```typescript
{
  message: "Hello Alex";
}
```

---

# 9. Real World Use Cases

---

# Use Case 1: Input Cleaning

Before:

```
User Question

```

After:

```
Clean Question

```

Flow:

```
User

↓

RunnableLambda

↓

Retriever

```

---

# Use Case 2: Adding Metadata

Example:

```typescript
{
 question:"What is RAG?",
 timestamp:"2026"
}
```

---

# Use Case 3: Validation

Example:

Check:

```
Is input empty?

Is input too long?

```

---

# Use Case 4: Response Formatting

Before:

```
AIMessage

```

After:

```
API Response Object

```

---

# 10. RunnableLambda vs Normal Function

Normal function:

```typescript
function clean(text) {
  return text.trim();
}
```

RunnableLambda:

```typescript
new RunnableLambda({
  func: clean,
});
```

Difference:

| Function           | RunnableLambda      |
| ------------------ | ------------------- |
| Normal JS function | LangChain component |
| No invoke          | Has invoke          |
| No streaming       | Supports streaming  |
| No tracing         | Supports callbacks  |
| Cannot pipe easily | LCEL compatible     |

---

# 11. RunnableLambda and Async Functions

RunnableLambda supports async.

Example:

```typescript
const fetchData = new RunnableLambda({
  async func(input) {
    const result = await database.find(input);

    return result;
  },
});
```

---

Flow:

```
Input

↓

RunnableLambda

↓

Database

↓

Output

```

---

# 12. RunnableLambda and Batch

Because it is a Runnable:

```typescript
const results = await uppercase.batch(["hello", "world"]);
```

Output:

```
[
"HELLO",
"WORLD"
]

```

---

# 13. Common Mistakes

---

## Mistake 1

Using RunnableLambda for everything.

Bad:

```
Huge business logic inside RunnableLambda

```

Better:

```
Small transformations only

```

---

## Mistake 2

Returning wrong data type.

Example:

Next step expects:

```
object

```

but receives:

```
string

```

---

## Mistake 3

Making external calls without error handling.

Example:

```
API request

Database query

```

Always handle failures.

---

# 14. Debugging RunnableLambda

## Test separately

Example:

```typescript
console.log(await formatter.invoke(" test "));
```

---

## Check input

Print:

```typescript
console.log(input);
```

---

## Check output

Before connecting:

```
RunnableLambda

↓

Next Component

```

verify compatibility.

---

# 15. Best Practices

- Keep functions small
- Use clear input/output types
- Add validation
- Avoid hidden side effects
- Handle errors
- Use for transformations, not entire applications

---

# Exercise

Answer:

## Question 1

What problem does RunnableLambda solve?

---

## Question 2

How is RunnableLambda different from a normal function?

---

## Question 3

Where would you use RunnableLambda in a RAG system?

---

## Question 4

Why must input and output formats match between Runnables?

---

## Question 5

Create a pipeline:

```
Input

↓

Clean Text

↓

Prompt

↓

Model

↓

Parser

```

---

# Mini Project

## Project: AI Query Cleaner

Create:

```
projects/

10-query-cleaner/

```

Build:

```
User Question

 |

RunnableLambda

(clean spaces,
remove unnecessary characters)

 |

Prompt Template

 |

Chat Model

 |

Parser

 |

Answer

```

Example:

Input:

```
"   explain RAG!!!   "
```

Output:

```
Clean AI explanation
```

Requirements:

Use:

- RunnableLambda
- LCEL
- ChatPromptTemplate
- Chat Model
- Output Parser

---

# Next Lesson

Continue with:

```
13-runnable-parallel.md
```

Topics:

- RunnableParallel
- Parallel execution
- Multiple outputs
- Combining results
- Parallel LCEL patterns
