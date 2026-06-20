import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer } from "better-auth/plugins";
import type { Db, MongoClient } from "mongodb";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

function parseOrigins(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getTrustedOrigins(): string[] {
  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:4000";

  return Array.from(
    new Set([
      baseUrl,
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:8082",
      ...parseOrigins(process.env.FRONTEND_ORIGINS),
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ]),
  );
}

let authInstance: ReturnType<typeof betterAuth> | null = null;

export function initAuth(client: MongoClient, db: Db): ReturnType<typeof betterAuth> {
  if (authInstance) {
    return authInstance;
  }

  authInstance = betterAuth({
    appName: "TicketFlow",
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: getTrustedOrigins(),
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false,
        },
      },
    },
    socialProviders: {
      ...(googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {}),
      ...(githubClientId && githubClientSecret
        ? {
            github: {
              clientId: githubClientId,
              clientSecret: githubClientSecret,
            },
          }
        : {}),
    },
    plugins: [bearer()],
  }) as unknown as ReturnType<typeof betterAuth>;

  return authInstance;
}

export function getAuth(): ReturnType<typeof betterAuth> {
  if (!authInstance) {
    throw new Error("Auth is not initialized. Call initAuth() after connecting to MongoDB.");
  }
  return authInstance;
}

type AuthCliProxy = {
  readonly handler: ReturnType<typeof getAuth>["handler"];
  readonly api: ReturnType<typeof getAuth>["api"];
  readonly $Infer: ReturnType<typeof getAuth>["$Infer"];
};

/** @deprecated Prefer initAuth() + getAuth() — kept for Better Auth CLI config resolution. */
export const auth: AuthCliProxy = {
  get handler() {
    return getAuth().handler;
  },
  get api() {
    return getAuth().api;
  },
  get $Infer() {
    return getAuth().$Infer;
  },
};
