# Lesson 11 — RunnableSequence

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand how LangChain executes multiple Runnables in order using RunnableSequence.

By the end of this lesson, you should understand:

- What RunnableSequence is
- Why RunnableSequence exists
- How LCEL creates sequences
- Sequential execution flow
- Creating RunnableSequence manually
- Input/output passing
- Error handling
- Debugging sequences
- Production patterns

---

# 1. What is RunnableSequence?

RunnableSequence is a Runnable that executes multiple Runnables one after another.

Simple definition:

```
RunnableSequence = A pipeline of Runnables executed in order
```

Example:

```
Step 1

Prompt


   ↓


Step 2

Model


   ↓


Step 3

Parser

```

---

# 2. Why Does RunnableSequence Exist?

AI applications usually require multiple steps.

Example:

A chatbot:

```
User Question

      |

Create Prompt

      |

Call Model

      |

Parse Response

      |

Return Answer

```

Without sequences:

```typescript
const promptResult = await prompt.invoke(input);

const modelResult = await model.invoke(promptResult);

const final = await parser.invoke(modelResult);
```

This becomes repetitive.

---

# RunnableSequence Solution

Instead:

```typescript
const chain = prompt.pipe(model).pipe(parser);
```

LangChain creates:

```
RunnableSequence

        |

---------------------

|          |          |

Prompt   Model    Parser

```

---

# 3. RunnableSequence Architecture

```
                 RunnableSequence


                        |

        --------------------------------

        |              |               |

    Runnable 1     Runnable 2     Runnable 3


        |              |               |


     Output         Output          Output


                        |

                        v


                    Final Result

```

---

# 4. LCEL Creates RunnableSequence Automatically

When you write:

```typescript
const chain = prompt.pipe(model).pipe(parser);
```

Internally:

```
prompt.pipe(model).pipe(parser)


                |

                v


        RunnableSequence

```

---

# 5. Basic RunnableSequence Example

```typescript
import { RunnableSequence } from "@langchain/core/runnables";

const sequence = RunnableSequence.from([
  async (input: string) => {
    return input.toUpperCase();
  },

  async (input: string) => {
    return `Processed: ${input}`;
  },
]);

const result = await sequence.invoke("hello");

console.log(result);
```

---

# Code Explanation

## Import RunnableSequence

```typescript
import { RunnableSequence } from "@langchain/core/runnables";
```

Imports the sequence constructor.

---

## Create Sequence

```typescript
RunnableSequence.from([]);
```

Creates a pipeline.

---

## First Step

```typescript
input.toUpperCase();
```

Input:

```
hello
```

Output:

```
HELLO
```

---

## Second Step

Receives:

```
HELLO
```

Returns:

```
Processed: HELLO
```

---

# Execution Flow

```
Input

hello

 |

Step 1

HELLO

 |

Step 2

Processed: HELLO

 |

Output

```

---

# 6. RunnableSequence With LangChain Components

Real example:

```
Prompt

 |

Chat Model

 |

Parser

```

Code:

```typescript
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate } from "@langchain/core/prompts";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { RunnableSequence } from "@langchain/core/runnables";

const prompt = ChatPromptTemplate.fromTemplate("Explain {topic}");

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
});

const parser = new StringOutputParser();

const chain = RunnableSequence.from([prompt, model, parser]);

const result = await chain.invoke({
  topic: "LangChain",
});

console.log(result);
```

---

# 7. Input and Output Passing

RunnableSequence passes outputs automatically.

Example:

```
Input

{
topic:"RAG"
}


 |

Prompt


Output:

"Explain RAG"


 |

Model


Output:

AIMessage


 |

Parser


Output:

"RAG is..."

```

---

# 8. Data Transformation Between Steps

Sometimes the next Runnable needs different data.

Example:

```
Input

{
name:"John"
}

```

Need:

```
Hello John

```

Use transformation:

```
Input

 |

RunnableLambda

 |

Prompt

 |

Model

```

---

# Example

```typescript
import { RunnableLambda } from "@langchain/core/runnables";

const formatter = new RunnableLambda({
  func: (input: { name: string }) => {
    return `Hello ${input.name}`;
  },
});
```

---

# Flow:

```
{
name:"Alex"
}

      |

      v

RunnableLambda

      |

      v

Hello Alex

```

---

# 9. RunnableSequence vs Normal Function Chain

Normal JavaScript:

```typescript
function step1() {}

function step2() {}

function step3() {}
```

Problems:

- No streaming
- No tracing
- No standard interface

---

RunnableSequence:

```
Runnable

+

Runnable

+

Runnable

```

Provides:

- invoke
- batch
- stream
- callbacks
- tracing

---

# 10. RunnableSequence and Streaming

Sequences support streaming.

Example:

```
Prompt

 |

Model

 |

Parser

```

can stream:

```
Token 1

Token 2

Token 3

```

Code:

```typescript
const stream = await chain.stream({
  topic: "AI",
});

for await (const chunk of stream) {
  console.log(chunk);
}
```

---

# 11. RunnableSequence and Batch

Example:

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

Execution:

```
Input 1

Input 2


    |

Sequence


    |

Output 1

Output 2

```

---

# 12. Error Handling

Errors can happen:

```
Prompt

 |

Model

 |

Parser

```

Example:

```
Invalid API key

Invalid response

Parsing failure

```

---

Debug by checking each step.

Instead of:

```
Full Chain

```

Test:

```
Prompt

↓

Model

↓

Parser

```

---

# 13. Common Mistakes

---

## Mistake 1

Putting unrelated steps together.

Bad:

```
Prompt

 |

Database

 |

Model

```

when outputs do not match.

---

## Mistake 2

Ignoring input/output types.

Every step must understand:

```
Input

Output

```

---

## Mistake 3

Creating extremely large sequences.

Bad:

```
30-step chain

```

Better:

```
Small reusable sequences

```

---

# 14. Debugging RunnableSequence

## Inspect each Runnable

Example:

```typescript
const promptResult = await prompt.invoke(input);

console.log(promptResult);
```

---

## Check sequence order

Verify:

```
Step 1

↓

Step 2

↓

Step 3

```

---

## Log intermediate results

Useful during development.

---

# 15. Best Practices

- Keep sequences small
- Use clear input/output formats
- Add parsers at boundaries
- Separate reusable steps
- Use LCEL pipe syntax when possible
- Use tracing in production

---

# Exercise

Answer:

## Question 1

What is RunnableSequence?

---

## Question 2

What does this create?

```typescript
prompt.pipe(model).pipe(parser);
```

---

## Question 3

How does data move between steps?

---

## Question 4

Why is RunnableSequence better than normal functions?

---

## Question 5

Draw:

```
Prompt

↓

Model

↓

Parser

```

as a RunnableSequence.

---

# Mini Project

## Project: Blog Explanation Pipeline

Create:

```
projects/

09-blog-explainer/

```

Build:

```
Topic

 |

Prompt Generator

 |

AI Writer

 |

Output Parser

 |

Final Article

```

Requirements:

Use:

- RunnableSequence
- Prompt Template
- Chat Model
- Output Parser

Input:

```
topic:
"AI Agents"

```

Output:

```
A formatted blog explanation
```

---

# Next Lesson

Continue with:

```
12-runnable-lambda.md
```

Topics:

- RunnableLambda
- Custom logic inside LCEL
- Data transformation
- Function wrapping
- Real-world use cases
