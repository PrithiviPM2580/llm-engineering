import { db } from "./db";

async function getSchema() {
  const collections = await db.listCollections().toArray();
  console.log(collections);
}

getSchema().catch((err) => {
  console.error("Error fetching schema:", err);
});
