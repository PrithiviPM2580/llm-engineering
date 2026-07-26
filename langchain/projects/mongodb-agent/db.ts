import "dotenv/config";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("MONGO_URI environment variable is not defined");
}

const client = new MongoClient(mongoUri);

await client.connect();

export const db = client.db(process.env.DB_NAME!);
