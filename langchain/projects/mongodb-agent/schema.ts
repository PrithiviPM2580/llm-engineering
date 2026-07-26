import { z } from "zod";

export const findDocumentsSchema = z.object({
  collection: z.string().describe("MongoDB collection name"),

  filter: z
    .record(z.string(), z.any())
    .optional()
    .describe("MongoDB filter object"),

  projection: z
    .record(z.string(), z.any())
    .optional()
    .describe("Fields to return"),

  limit: z
    .number()
    .optional()
    .describe("Maximum number of documents to return"),
});

export const aggregateDocumentsSchema = z.object({
  collection: z.string().describe("MongoDB collection name"),
  pipeline: z
    .array(z.record(z.string(), z.any()))
    .describe("MongoDB aggregation pipeline"),
});

export const countDocumentsSchema = z.object({
  collection: z.string().describe("MongoDB collection name"),
  filter: z
    .record(z.string(), z.any())
    .optional()
    .describe("MongoDB filter object"),
});

export type FindDocumentsSchema = z.infer<typeof findDocumentsSchema>;
export type AggregateDocumentsSchema = z.infer<typeof aggregateDocumentsSchema>;
export type CountDocumentsSchema = z.infer<typeof countDocumentsSchema>;
