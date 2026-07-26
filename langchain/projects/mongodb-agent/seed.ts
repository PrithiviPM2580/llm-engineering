import { db } from "./db";

async function seedDatabase() {
  const users = db.collection("users");

  await users.insertMany([
    {
      name: "Alice",
      email: "alice@example.com",
      age: 25,
      role: "developer",
    },
    {
      name: "Bob",
      email: "bob@example.com",
      age: 30,
      role: "designer",
    },
    {
      name: "Charlie",
      email: "charlie@example.com",
      age: 28,
      role: "manager",
    },
    {
      name: "David",
      email: "david@example.com",
      age: 35,
      role: "developer",
    },
    {
      name: "Eve",
      email: "eve@example.com",
      age: 26,
      role: "designer",
    },
    {
      name: "Frank",
      email: "frank@example.com",
      age: 32,
      role: "manager",
    },
    {
      name: "Grace",
      email: "grace@example.com",
      age: 29,
      role: "developer",
    },
    {
      name: "Heidi",
      email: "heidi@example.com",
      age: 27,
      role: "designer",
    },
  ]);

  console.log("Database seeded successfully");
}

seedDatabase().catch((err) => {
  console.error("Seeding failed:", err);
});
