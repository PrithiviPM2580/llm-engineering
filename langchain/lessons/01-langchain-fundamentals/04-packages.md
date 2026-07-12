# Lesson 04 — LangChain Packages

## Level

Level 1 — LangChain Fundamentals

---

# Goal

Understand how LangChain is split into packages and learn which package should be used for different parts of an AI application.

By the end of this lesson, you should understand:

- Why LangChain is divided into multiple packages
- Purpose of each package
- Difference between core, community, and provider packages
- How packages interact
- Production project dependency structure

---

# 1. Why Does LangChain Have Multiple Packages?

A beginner mistake is thinking:

```
LangChain = One Package
```

Modern LangChain is modular.

The ecosystem looks like:

```
                 LangChain Ecosystem


                        Application


                             |

                             v


                    @langchain/core


                             |

        --------------------------------------------

        |                    |                     |

    langchain        @langchain/community     Providers


                             |

        --------------------------------------------

        |                    |                     |

     OpenAI             Anthropic             Gemini

```

---

# Why Modular Design?

Imagine every integration was inside one package.

Example:

```
langchain

 ├── OpenAI

 ├── Anthropic

 ├── Pinecone

 ├── Chroma

 ├── PDF loaders

 ├── Web loaders

 ├── Database tools

 └── Everything else

```

Problems:

- Huge package size
- Slow installation
- Hard maintenance
- Unnecessary dependencies

Instead LangChain separates responsibilities.

---

# 2. @langchain/core

Package:

```
@langchain/core
```

This is the foundation of LangChain.

Almost every LangChain application uses it.

---

# What Does Core Contain?

## Runnables

The main execution abstraction.

Example:

```
Input

 |

Runnable

 |

Output

```

Used by:

- Models
- Prompts
- Parsers
- Chains

---

## Messages

Communication format with chat models.

Examples:

```
SystemMessage

HumanMessage

AIMessage

ToolMessage

```

---

## Prompt Templates

Reusable prompts.

Example:

```
Explain {topic}

```

---

## Output Parsers

Convert model output into application data.

Example:

```
Text Response

        |

        v

JSON Object

```

---

## Callbacks

Used for:

- Logging
- Monitoring
- Streaming
- Tracing

---

# Core Mental Model

Think:

```
@langchain/core

=

LangChain Building Blocks

```

It does not contain every integration.

It defines the interfaces.

---

# 3. langchain Package

Package:

```
langchain
```

This provides higher-level application functionality.

---

# What Does It Include?

## Chains

Combining multiple steps.

Example:

```
Prompt

 |

Model

 |

Parser

```

---

## Agents

AI systems that can use tools.

Example:

```
User

 |

Agent

 |

Tool

 |

Answer

```

---

## Retrievers

Finding relevant information.

Example:

```
Question

 |

Retriever

 |

Documents

```

---

## Document Processing Utilities

Examples:

- Loading documents
- Splitting documents
- Processing content

---

# Mental Model

Think:

```
langchain

=

Application Building Tools

```

---

# 4. @langchain/community

Package:

```
@langchain/community
```

Contains community integrations.

---

# Why Community?

LangChain supports hundreds of external services.

Examples:

```
Vector Databases

Document Loaders

Search Engines

APIs

Tools

```

Maintaining all of them inside the main package would be difficult.

---

# Examples

## Vector Stores

```
Chroma

FAISS

Pinecone

Qdrant

Weaviate

```

---

## Document Loaders

```
PDF Loader

CSV Loader

Web Loader

Directory Loader

```

---

## Tools

Examples:

```
Search Tool

Database Tool

API Tool

```

---

# Mental Model

Think:

```
@langchain/community

=

External Integrations

```

---

# 5. Provider Packages

Provider packages connect LangChain to AI providers.

Examples:

```
@langchain/openai

@langchain/anthropic

@langchain/google-genai

```

---

# Why Separate Providers?

Different AI providers have different APIs.

Example:

OpenAI:

```
OpenAI API

    |

ChatOpenAI

```

Anthropic:

```
Anthropic API

    |

ChatAnthropic

```

Google:

```
Gemini API

    |

ChatGoogleGenerativeAI

```

LangChain normalizes them.

---

# Provider Architecture

```
              Your Application


                    |

                    v


              LangChain API


                    |

       -----------------------------

       |             |             |

   OpenAI        Claude        Gemini


       |             |             |


       v             v             v


    Provider APIs

```

---

# 6. Package Interaction Example

A real RAG application may use:

```
@langchain/core

        +

langchain

        +

@langchain/community

        +

@langchain/openai

```

Architecture:

```
             PDF File


                |

                v


     @langchain/community

        PDF Loader


                |

                v


       Text Splitter


                |

                v


        Embeddings


                |

                v


       Vector Store


                |

                v


          Retriever


                |

                v


        @langchain/openai

          Chat Model


                |

                v


            Answer

```

---

# 7. Example Dependencies

A production project may have:

```json
{
  "dependencies": {
    "@langchain/core": "latest",

    "langchain": "latest",

    "@langchain/community": "latest",

    "@langchain/openai": "latest"
  }
}
```

---

# 8. Import Examples

## Core Import

```typescript
import { HumanMessage } from "@langchain/core/messages";
```

Used for messages.

---

## OpenAI Import

```typescript
import { ChatOpenAI } from "@langchain/openai";
```

Used for OpenAI models.

---

## Community Import

Example:

```typescript
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
```

Used for PDF loading.

---

# 9. Production Folder Structure

A good project:

```
src/

├── models/

│   └── openai.ts


├── prompts/

│   └── chatbot.ts


├── loaders/

│   └── pdf.ts


├── retrievers/

│   └── vector.ts


├── chains/

│   └── rag.ts


└── index.ts

```

---

# 10. Common Mistakes

---

## Mistake 1

Installing only:

```
langchain
```

and expecting everything.

Modern LangChain is modular.

---

## Mistake 2

Mixing provider logic everywhere.

Bad:

```
chatbot.ts

OpenAI code

Prompt code

Database code

```

Better:

```
models/

prompts/

services/

```

---

## Mistake 3

Using community packages without checking dependencies.

Community packages may require:

- Extra libraries
- API keys
- Configuration

---

# 11. Debugging Package Problems

## Check installed packages

```bash
npm list
```

---

## Check package version

```bash
npm view @langchain/core version
```

---

## Module not found error

Example:

```
Cannot find module '@langchain/openai'
```

Solution:

Install:

```bash
npm install @langchain/openai
```

---

## Import errors

Check:

- Correct package name
- Correct export
- Package version

---

# 12. Best Practices

Use only packages you need.

Example:

Simple chatbot:

```
@langchain/core

+

@langchain/openai

```

RAG system:

```
@langchain/core

+

langchain

+

@langchain/community

+

provider package

```

---

# Exercise

Answer:

## Question 1

What is the purpose of `@langchain/core`?

---

## Question 2

What belongs inside `@langchain/community`?

---

## Question 3

Why are provider packages separated?

---

## Question 4

Which packages would you use for a PDF chatbot?

---

## Question 5

Explain:

```
core

vs

langchain

vs

community

vs

provider

```

---

# Mini Project

## Project: Package Explorer

Create:

```
projects/

02-package-explorer/

```

Create:

```
src/

├── core-example.ts

├── model-example.ts

└── community-example.ts

```

Requirements:

Demonstrate:

1. A message from `@langchain/core`

2. A Chat Model from `@langchain/openai`

3. A loader from `@langchain/community`

Architecture:

```
Core

 |

Provider

 |

Community Integration

 |

Application

```

---

# Next Lesson

Continue with:

```
05-runnable-interface.md
```

Topics:

- What is Runnable?
- Why Runnable exists
- Runnable methods
- invoke()
- batch()
- stream()
- Runnable composition
- Runnable ecosystem
