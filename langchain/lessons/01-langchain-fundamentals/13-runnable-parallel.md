# Lesson 13 — RunnableParallel

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand how to execute multiple LangChain Runnables at the same time using RunnableParallel.

By the end of this lesson, you should understand:

- What RunnableParallel is
- Why parallel execution exists
- Sequential vs parallel workflows
- RunnableParallel architecture
- Multiple outputs
- Combining parallel results
- Real-world use cases
- Debugging parallel execution
- Best practices

---

# 1. What is RunnableParallel?

RunnableParallel allows multiple Runnables to execute simultaneously using the same input.

Simple definition:

```
RunnableParallel = Run multiple Runnables at the same time
```

Example:

```
              Input

                |

        ----------------

        |              |

    Task A          Task B


        |              |


    Result A       Result B


        |

        v


      Combined Output

```

---

# 2. Why Does RunnableParallel Exist?

Many AI applications need multiple independent operations.

Example:

A document analyzer:

```
Document

    |

 --------------------

 |                  |

Summarize        Extract Keywords


 |                  |


Summary        Keywords

```

These tasks do not depend on each other.

Running them one by one wastes time.

---

# Sequential Approach

Without parallel execution:

```
Document

 |

Summarize

 |

Wait

 |

Extract Keywords

 |

Result

```

Time:

```
5 seconds

+

5 seconds

=

10 seconds

```

---

# Parallel Approach

With RunnableParallel:

```
Document

     |

 ----------------

 |              |

Summary      Keywords


 |              |


 ----------------


       |

    Result

```

Time:

```
5 seconds

```

---

# 3. RunnableParallel Architecture

```
                    Input


                      |

                      v


              RunnableParallel


        ----------------------------


        |             |            |


    Runnable A    Runnable B   Runnable C


        |             |            |


    Output A     Output B    Output C


        |             |            |


        ----------------------------


                      |

                      v


              Combined Object

```

---

# 4. Creating RunnableParallel

Import:

```typescript
import { RunnableParallel } from "@langchain/core/runnables";
```

---

Basic example:

```typescript
const parallel = new RunnableParallel({
  upper: async (input: string) => {
    return input.toUpperCase();
  },

  length: async (input: string) => {
    return input.length;
  },
});
```

---

Input:

```
hello

```

Output:

```json
{
  "upper": "HELLO",
  "length": 5
}
```

---

# 5. Using invoke()

Example:

```typescript
const result = await parallel.invoke("hello");

console.log(result);
```

---

Execution:

```
Input:

hello


        |

        v


 -----------------

 |               |

Upper          Length


 |               |

HELLO            5


        |

        v


{
upper:"HELLO",
length:5
}

```

---

# 6. RunnableParallel With LCEL

RunnableParallel is commonly used inside LCEL pipelines.

Example:

```
Input

 |

Parallel Tasks

 |

Combine Results

 |

Model

```

---

Example:

```typescript
const chain = new RunnableParallel({
  summary: summaryChain,

  keywords: keywordChain,
});
```

---

# 7. Complete LangChain Example

```typescript
import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate } from "@langchain/core/prompts";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { RunnableParallel } from "@langchain/core/runnables";

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
});

const summaryPrompt = ChatPromptTemplate.fromTemplate(
  "Summarize this text: {text}",
);

const keywordPrompt = ChatPromptTemplate.fromTemplate(
  "Extract keywords from: {text}",
);

const parser = new StringOutputParser();

const summaryChain = summaryPrompt.pipe(model).pipe(parser);

const keywordChain = keywordPrompt.pipe(model).pipe(parser);

const parallel = new RunnableParallel({
  summary: summaryChain,

  keywords: keywordChain,
});

const result = await parallel.invoke({
  text: "LangChain helps developers build applications using language models.",
});

console.log(result);
```

---

# Output Example

```json
{
  "summary": "LangChain helps build AI applications.",

  "keywords": "LangChain, AI, applications"
}
```

---

# 8. Data Flow Explanation

Input:

```json
{
  "text": "LangChain..."
}
```

Goes to both:

```
summaryChain

and

keywordChain

```

At the same time.

---

Flow:

```
              Input


                |

                v


        RunnableParallel


        /              \


 Summary Chain     Keyword Chain


        |              |


        v              v


    Summary        Keywords


        \              /


          Combined Object

```

---

# 9. RunnableParallel With RunnableLambda

Custom transformations can also run in parallel.

Example:

```typescript
const analysis = new RunnableParallel({
  uppercase: new RunnableLambda({
    func: (x: string) => x.toUpperCase(),
  }),

  words: new RunnableLambda({
    func: (x: string) => x.split(" "),
  }),
});
```

---

Input:

```
hello langchain

```

Output:

```json
{
  "uppercase": "HELLO LANGCHAIN",
  "words": ["hello", "langchain"]
}
```

---

# 10. RunnableParallel vs RunnableSequence

Important difference:

---

## RunnableSequence

Runs steps one after another.

```
A

↓

B

↓

C

```

Example:

```
Prompt

↓

Model

↓

Parser

```

---

## RunnableParallel

Runs steps together.

```
       A

Input

       B

       C

```

---

Comparison:

| RunnableSequence       | RunnableParallel       |
| ---------------------- | ---------------------- |
| Ordered execution      | Simultaneous execution |
| Output feeds next step | Same input goes to all |
| Pipeline               | Fan-out                |
| A → B → C              | A + B + C              |

---

# 11. Real-World Use Cases

---

## Use Case 1: Multi Analysis

Input:

```
Document

```

Parallel:

```
Summary

Keywords

Sentiment

Category

```

---

## Use Case 2: RAG Enhancement

Question:

```
User Question

```

Parallel:

```
Vector Search

Keyword Search

Metadata Search

```

---

## Use Case 3: AI Evaluation

Response:

```
AI Answer

```

Parallel:

```
Accuracy Check

Style Check

Safety Check

```

---

# 12. Common Mistakes

---

## Mistake 1

Using parallel when tasks depend on each other.

Wrong:

```
Generate Text

↓

Summarize Generated Text

```

This is sequential.

---

## Mistake 2

Expecting one output.

RunnableParallel returns:

```json
{
  "task1": "",
  "task2": ""
}
```

---

## Mistake 3

Running expensive tasks unnecessarily.

Parallel increases resource usage.

---

# 13. Debugging RunnableParallel

## Check each branch separately

Instead of:

```
Parallel

```

Test:

```
Branch A

Branch B

```

---

## Inspect output keys

Example:

Expected:

```json
{
  "summary": "",
  "keywords": ""
}
```

Check:

```typescript
console.log(result);
```

---

## Monitor failures

One failed branch can fail the whole execution.

---

# 14. Best Practices

- Use parallel only for independent tasks
- Give branches clear names
- Keep outputs structured
- Handle branch failures
- Avoid unnecessary API calls
- Combine with parsers for clean outputs

---

# Exercise

Answer:

## Question 1

What is RunnableParallel?

---

## Question 2

When should you use RunnableParallel instead of RunnableSequence?

---

## Question 3

What happens to the input in RunnableParallel?

---

## Question 4

Draw:

```
Input

↓

Task A

Task B

↓

Output

```

---

## Question 5

Give one RAG use case for RunnableParallel.

---

# Mini Project

## Project: AI Document Analyzer

Create:

```
projects/

11-document-analyzer/

```

Build:

```
Document

      |

      v

RunnableParallel


 ---------------------

 |          |         |

Summary  Keywords  Category


 ---------------------


      |

      v


Final JSON Response

```

Requirements:

Use:

- RunnableParallel
- ChatPromptTemplate
- Chat Model
- Output Parser

Input:

```
A document about LangChain architecture

```

Output:

```json
{
  "summary": "",
  "keywords": "",
  "category": ""
}
```

---

# Next Lesson

Continue with:

```
14-runnable-passthrough.md
```

Topics:

- RunnablePassthrough
- Passing original input
- Combining data
- RAG patterns
- Input preservation
- LCEL data flow
