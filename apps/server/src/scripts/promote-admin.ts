import "dotenv/config";
import mongoose from "mongoose";
import { connectDb, getDatabaseName } from "../lib/db.js";

async function promoteAdmin(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error("Usage: bun src/scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await connectDb(uri);

  const db = mongoose.connection.getClient().db(getDatabaseName(uri));
  const result = await db
    .collection("user")
    .updateOne({ email }, { $set: { role: "admin" } });

  if (result.matchedCount === 0) {
    console.error(`No user found with email: ${email}`);
    console.error("Register that account first, then run this script again.");
    process.exit(1);
  }

  console.log(`Promoted ${email} to admin`);
  await mongoose.disconnect();
}

promoteAdmin().catch((error) => {
  console.error("Promote admin failed:", error);
  process.exit(1);
});
