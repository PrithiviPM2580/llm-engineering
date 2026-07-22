import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z
    .string("MONGODB_URI is required")
    .min(1, "MONGODB_URI cannot be empty"),
});

const checkEnv = (env: Record<string, string | undefined>) => {
  const parsedEnv = envSchema.safeParse(env);

  if (!parsedEnv.success) {
    console.error(
      "Invalid environment variables:",
      parsedEnv.error.issues.map((issue) => {
        return `${issue.path.join(".")}: ${issue.message}`;
      }),
    );
    process.exit(1);
  }
  return parsedEnv.data;
};

export const env = checkEnv(process.env);
