import { initAuth } from "@repo/auth";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { startCleanupCron } from "./jobs/scheduleCleanup.js";
import { connectDb, getDatabaseName } from "./lib/db.js";
import { adminRouter } from "./routes/admin.js";
import { bookingsRouter, reserveRouter } from "./routes/bookings.js";
import { eventsRouter } from "./routes/events.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not configured");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not configured");
}

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"],
    credentials: true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function main(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await connectDb(mongoUri);

  const client = mongoose.connection.getClient();
  const db = client.db(getDatabaseName(mongoUri));
  const auth = initAuth(client, db);

  app.all("/api/auth/{*path}", toNodeHandler(auth));

  app.use(express.json());

  app.use("/api/events", eventsRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/reserve", reserveRouter);
  app.use("/api/reservations", reserveRouter);
  app.use("/api/bookings", bookingsRouter);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    },
  );

  startCleanupCron();

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
