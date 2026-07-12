# Lesson 05 — Runnable Interface

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand the Runnable interface, the foundation of modern LangChain.

The Runnable system is one of the most important concepts in LangChain because almost everything in LangChain is built around it.

By the end of this lesson, you should understand:

- What a Runnable is
- Why Runnable exists
- Runnable input and output flow
- Runnable methods
- How components become composable
- Where Runnable fits in the LangChain ecosystem
- How Runnable powers LCEL

---

# 1. What is a Runnable?

A Runnable is a standard interface that defines how a component executes.

Simple definition:

```
Runnable = Something that can receive input and produce output
```

Basic flow:

```
Input

  |

  v

Runnable

  |

  v

Output

```

Examples of Runnables:

- Prompt templates
- Chat models
- Output parsers
- Retrievers
- Chains
- Agents

---

# 2. Why Does Runnable Exist?

Before Runnable, every component had different APIs.

Example:

A model:

```typescript
model.call();
```

A chain:

```typescript
chain.run();
```

A parser:

```typescript
parser.parse();
```

Different components used different methods.

Problem:

```
Component A

     |

Different API

     |

Component B

     |

Different API

```

Composition became difficult.

---

# Runnable Solution

LangChain created a common interface:

```
Everything

      |

      v

Runnable

      |

      v

Same execution methods

```

Now every component understands:

```
invoke()

batch()

stream()

```

---

# 3. Runnable Architecture

High-level view:

```
                 Runnable


                     |

        --------------------------------

        |              |               |

     Prompt          Model          Parser


        |              |               |

        v              v               v


   Formatted       AI Response     Parsed Data

```

All components follow the same contract.

---

# 4. Runnable Input and Output

Every Runnable has:

```
Input Type

     |

Runnable

     |

Output Type

```

Example:

Prompt Template:

Input:

```typescript
{
  topic: "LangChain";
}
```

Output:

```
Explain LangChain
```

---

Model:

Input:

```
Message[]

```

Output:

```
AIMessage

```

---

Parser:

Input:

```
AIMessage

```

Output:

```
JSON Object

```

---

# 5. Runnable Methods

The main Runnable methods:

```
invoke()

batch()

stream()

```

---

# 5.1 invoke()

Used for a single execution.

Flow:

```
One Input

    |

invoke()

    |

One Output

```

Example:

```typescript
const result = await runnable.invoke("Explain LangChain");
```

Use when:

- One user request
- Normal application flow

---

# 5.2 batch()

Used for multiple inputs.

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

Example:

```typescript
const results = await runnable.batch([
  "Explain AI",
  "Explain RAG",
  "Explain Agents",
]);
```

Use when:

- Processing multiple items
- Bulk operations

---

# 5.3 stream()

Used for streaming responses.

Flow:

```
Input

 |

stream()

 |

Token

Token

Token

Token

```

Example:

```
Lang

LangChain

LangChain is

LangChain is a framework

```

Use for:

- Chat applications
- Real-time UI

---

# 6. Runnable Example

Create:

```
examples/

runnable-basic.ts

```

Code:

```typescript
import { RunnableLambda } from "@langchain/core/runnables";

const runnable = new RunnableLambda({
  func: async (input: string) => {
    return input.toUpperCase();
  },
});

const result = await runnable.invoke("hello langchain");

console.log(result);
```

---

# Code Explanation

## Import RunnableLambda

```typescript
import { RunnableLambda } from "@langchain/core/runnables";
```

Imports a Runnable implementation.

---

## Create Runnable

```typescript
const runnable = new RunnableLambda({
```

Creates a custom runnable.

---

## Function

```typescript
func: async (input:string)=>{
```

Defines what the Runnable does.

Input:

```
string
```

Output:

```
string
```

---

## Transform Data

```typescript
return input.toUpperCase();
```

Example:

Input:

```
hello langchain
```

Output:

```
HELLO LANGCHAIN
```

---

## Execute Runnable

```typescript
runnable.invoke();
```

Runs the component.

---

# 7. Runnable Composition

The real power of Runnable is composition.

Example:

```
Prompt

 |

Model

 |

Parser

```

Each piece is a Runnable.

They connect together.

---

# Example:

```typescript
const chain = prompt.pipe(model).pipe(parser);
```

Flow:

```
User Input

    |

Prompt Runnable

    |

Model Runnable

    |

Parser Runnable

    |

Final Output

```

---

# 8. Runnable vs Function

You may ask:

Why not just use JavaScript functions?

Normal function:

```typescript
function add(a, b) {
  return a + b;
}
```

Runnable provides more:

- Standard interface
- Streaming
- Async support
- Composition
- Logging
- Callbacks
- Tracing

---

# Function:

```
Input

 |

Function

 |

Output

```

Runnable:

```
Input

 |

Runnable

 |

Output


+

Streaming

+

Tracing

+

Composition

+

Configuration

```

---

# 9. Runnable Ecosystem

Many LangChain objects are Runnables.

Architecture:

```
                    Runnable


                       |

 ------------------------------------------------


 |              |              |              |


Prompt        Model          Parser       Retriever


 |              |              |              |


ChatPrompt    ChatOpenAI    JSONParser   VectorSearch

```

---

# 10. Runnable in LCEL

LCEL is built on Runnable.

Example:

```typescript
const chain = prompt.pipe(model).pipe(parser);
```

Internally:

```
RunnableSequence

        |

        |

Prompt Runnable

        |

Model Runnable

        |

Parser Runnable

```

---

# 11. Common Mistakes

---

## Mistake 1

Thinking Runnable is only for models.

Wrong.

Everything can be a Runnable.

---

## Mistake 2

Calling components directly.

Example:

```typescript
model.call();
```

Modern LangChain uses:

```typescript
model.invoke();
```

---

## Mistake 3

Building chains without understanding Runnable.

Chains are built from Runnables.

Understand Runnable first.

---

# 12. Debugging Runnable Problems

## Check input

Before:

```
Runnable

```

Ask:

```
What data type does it expect?

```

---

## Check output

After:

```
Runnable

```

Ask:

```
What does it return?

```

---

## Test separately

Instead of:

```
Prompt -> Model -> Parser

```

Test:

```
Prompt only

Model only

Parser only

```

---

# 13. Best Practices

- Prefer Runnable composition
- Keep components small
- Use invoke for normal requests
- Use stream for interactive apps
- Use batch for bulk processing
- Design components with clear inputs and outputs

---

# Exercise

Answer:

## Question 1

What problem does Runnable solve?

---

## Question 2

What are the three main Runnable execution methods?

---

## Question 3

Why are Prompt Templates and Models both Runnables?

---

## Question 4

Explain the difference:

```
Function

vs

Runnable

```

---

## Question 5

Draw the execution flow:

```
Prompt → Model → Parser
```

using Runnable concepts.

---

# Mini Project

## Project: Custom Text Processing Pipeline

Create:

```
projects/

03-runnable-pipeline/

```

Build:

```
Input Text

    |

Runnable 1

(Convert lowercase)

    |

Runnable 2

(Remove spaces)

    |

Runnable 3

(Count characters)

    |

Output

```

Example:

Input:

```
Hello LangChain
```

Output:

```
{
 cleaned:"hellolangchain",
 length:14
}
```

Requirements:

Use:

- RunnableLambda
- invoke()
- Runnable composition

---

# Next Lesson

Continue with:

```
06-chat-models.md
```

Topics:

- What are Chat Models?
- LLM vs Chat Model
- Chat model architecture
- Providers
- ChatOpenAI
- Model parameters
- invoke()
- streaming responses
