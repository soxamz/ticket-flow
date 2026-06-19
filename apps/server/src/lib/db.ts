import dns from "node:dns";
import mongoose from "mongoose";

function readEnv(name: string): string | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return undefined;
  }

  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1);
  }

  return raw;
}

function configureDnsForAtlas(uri: string): void {
  if (!uri.startsWith("mongodb+srv://")) {
    return;
  }

  const servers = readEnv("MONGODB_DNS_SERVERS")
    ?.split(",")
    .map((s) => s.trim());
  dns.setServers(servers?.length ? servers : ["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
}

export function getDatabaseName(uri: string): string {
  const configured = readEnv("MONGODB_DB_NAME");
  if (configured) {
    return configured;
  }

  const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//, "");
  const path = withoutProtocol.includes("/")
    ? withoutProtocol.slice(withoutProtocol.indexOf("/") + 1)
    : "";
  const dbName = path.split("?")[0]?.split("/")[0];

  return dbName || "ticketflow";
}

export async function connectDb(uri: string): Promise<void> {
  configureDnsForAtlas(uri);
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}
