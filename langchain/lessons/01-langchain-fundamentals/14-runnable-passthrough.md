# Lesson 14 — RunnablePassthrough

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand how RunnablePassthrough allows data to pass through a LangChain pipeline unchanged and why it is essential for building real-world LCEL applications.

By the end of this lesson, you should understand:

- What RunnablePassthrough is
- Why it exists
- How data flows through LCEL
- Input preservation
- Combining original input with generated data
- RunnablePassthrough in RAG systems
- RunnablePassthrough with RunnableParallel
- Debugging data flow problems
- Best practices

---

# 1. What is RunnablePassthrough?

RunnablePassthrough is a Runnable that returns the input exactly as it receives it.

Simple definition:

```
RunnablePassthrough = Keep the original input unchanged
```

Example:

Input:

```typescript
{
  question: "What is RAG?";
}
```

Output:

```typescript
{
  question: "What is RAG?";
}
```

Nothing changes.

---

# 2. Why Does RunnablePassthrough Exist?

In LCEL pipelines, data is transformed step by step.

Example:

```
Input

 |

Prompt

 |

Model

 |

Parser

```

But sometimes you need the original input later.

Example:

RAG system:

```
Question

        |

Retrieve Documents


Question + Documents

        |

Prompt

        |

Model

```

The question must be preserved.

---

# The Problem

Without RunnablePassthrough:

```
Question

   |

Retriever

   |

Documents

```

The original question is lost.

---

# Solution

```
Question

       |

RunnablePassthrough

       |

Keep Question


Retriever

       |

Get Documents


       |

Combine Both

```

---

# 3. RunnablePassthrough Architecture

```
                 Input


                   |

                   v


          RunnablePassthrough


                   |

                   v


                Same Input


```

---

# 4. Creating RunnablePassthrough

Import:

```typescript
import { RunnablePassthrough } from "@langchain/core/runnables";
```

---

Example:

```typescript
const passthrough = new RunnablePassthrough();

const result = await passthrough.invoke("Hello LangChain");

console.log(result);
```

---

Output:

```
Hello LangChain

```

---

# 5. RunnablePassthrough With Objects

Most real applications use objects.

Example:

```typescript
const passthrough = new RunnablePassthrough();

const result = await passthrough.invoke({
  question: "What is RAG?",
});

console.log(result);
```

Output:

```json
{
  "question": "What is RAG?"
}
```

---

# 6. RunnablePassthrough in LCEL

The most common usage:

```
RunnableParallel

+

RunnablePassthrough

```

Example:

```
Input

 {
 question:"Explain RAG"
 }


        |

        v


 --------------------

 |                  |

question          context


Passthrough       Retriever


 --------------------


        |

        v


Prompt

```

---

# 7. RunnablePassthrough + RunnableParallel

Example:

```typescript
import {
  RunnableParallel,
  RunnablePassthrough,
} from "@langchain/core/runnables";

const chain = new RunnableParallel({
  question: new RunnablePassthrough(),

  context: async () => {
    return "Retrieved documents";
  },
});

const result = await chain.invoke({
  question: "Explain RAG",
});

console.log(result);
```

---

Output:

```json
{
  "question": "Explain RAG",

  "context": "Retrieved documents"
}
```

---

# Execution Flow

```
Input

{
question:"Explain RAG"
}


        |

        v


RunnableParallel


        /              \


Question             Context


Passthrough          Retriever


        \              /


          Combined Object

```

---

# 8. RunnablePassthrough.assign()

One of the most powerful features.

It allows adding new fields while keeping existing data.

Example:

Input:

```json
{
  "question": "What is AI?"
}
```

Add:

```json
{
  "question": "What is AI?",
  "length": 11
}
```

---

Example:

```typescript
const chain = RunnablePassthrough.assign({
  length: (input) => input.question.length,
});

const result = await chain.invoke({
  question: "What is AI?",
});

console.log(result);
```

---

Output:

```json
{
  "question": "What is AI?",
  "length": 11
}
```

---

# 9. Why assign() Is Useful

Real applications constantly enrich data.

Example:

Before:

```json
{
  "question": "Explain RAG"
}
```

After:

```json
{
question:"Explain RAG",

documents:[...],

metadata:{}

}
```

---

# 10. RunnablePassthrough in RAG

This is one of the most important patterns in LangChain.

A RAG pipeline:

```
User Question


      |

      v


Retriever


      |

      v


Documents


      |


 --------------------

 |                  |

Question          Context


      |              |


      ----------------


             |

             v


          Prompt


             |

             v


          Model


             |

             v


          Answer

```

---

RunnablePassthrough keeps:

```
Question

```

while retriever creates:

```
Context

```

---

# 11. Complete RAG-Style Example

```typescript
import {
  RunnableParallel,
  RunnablePassthrough,
} from "@langchain/core/runnables";

const retriever = async (question: string) => {
  return ["Document about LangChain", "Document about RAG"];
};

const chain = new RunnableParallel({
  context: async (input) => {
    return retriever(input.question);
  },

  question: new RunnablePassthrough(),
});

const result = await chain.invoke({
  question: "Explain LangChain",
});

console.log(result);
```

---

Output:

```json
{
  "context": ["Document about LangChain", "Document about RAG"],

  "question": {
    "question": "Explain LangChain"
  }
}
```

---

# 12. RunnablePassthrough vs RunnableLambda

Important difference.

---

## RunnablePassthrough

Purpose:

```
Keep data unchanged

```

Example:

```
Input

↓

Same Input

```

---

## RunnableLambda

Purpose:

```
Transform data

```

Example:

```
Input

↓

Modified Output

```

---

Comparison:

| RunnablePassthrough | RunnableLambda        |
| ------------------- | --------------------- |
| No transformation   | Custom transformation |
| Keeps input         | Changes input         |
| Data forwarding     | Data processing       |

---

# 13. Common Mistakes

---

## Mistake 1

Thinking it does nothing.

It solves a major LCEL data-flow problem.

---

## Mistake 2

Using Lambda when you only need the original value.

Bad:

```typescript
(input) => input;
```

Better:

```typescript
new RunnablePassthrough();
```

---

## Mistake 3

Forgetting object structure.

Example:

Input:

```json
{
  "question": "hello"
}
```

Access:

```typescript
input.question;
```

not:

```typescript
input;
```

---

# 14. Debugging RunnablePassthrough

## Print intermediate output

Example:

```typescript
const result = await chain.invoke(input);

console.log(result);
```

---

## Check keys

Verify:

```
question

context

metadata

```

exist.

---

## Follow the data path

Draw:

```
Input

↓

Step 1

↓

Step 2

↓

Output

```

---

# 15. Best Practices

- Use RunnablePassthrough for preserving inputs
- Use assign() for enriching objects
- Combine with RunnableParallel
- Use it heavily in RAG pipelines
- Keep data structures clear
- Avoid unnecessary transformations

---

# Exercise

Answer:

## Question 1

What does RunnablePassthrough do?

---

## Question 2

Why is it important in RAG?

---

## Question 3

Difference:

```
RunnableLambda

vs

RunnablePassthrough

```

---

## Question 4

What does assign() do?

---

## Question 5

Draw:

```
Question

+

Documents

↓

Prompt

↓

Model

```

using RunnablePassthrough.

---

# Mini Project

## Project: Mini RAG Data Flow Simulator

Create:

```
projects/

12-rag-data-flow/

```

Build:

```
User Question

        |

RunnableParallel


 --------------------

 |                  |

Question          Context

Passthrough       Retriever


 --------------------


        |

        v


Prompt

        |

        v


Model

        |

        v


Answer

```

Requirements:

Use:

- RunnableParallel
- RunnablePassthrough
- RunnableLambda
- LCEL composition

---

# Level 1 Completed

You have now learned:

✅ What is LangChain  
✅ Architecture  
✅ Packages  
✅ Runnable Interface  
✅ Chat Models  
✅ Messages  
✅ Prompt Templates  
✅ Output Parsers  
✅ LCEL  
✅ RunnableSequence  
✅ RunnableLambda  
✅ RunnableParallel  
✅ RunnablePassthrough

---

# Next Module

Move to:

```
02-building-chains/
```

Next lesson:

```
01-lcel-deep-dive.md
```

Topics:

- Advanced LCEL patterns
- Nested chains
- Composition strategies
- Conditional execution
- Dynamic workflows
