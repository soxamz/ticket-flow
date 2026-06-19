import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer } from "better-auth/plugins";
import type { Db, MongoClient } from "mongodb";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

let authInstance: ReturnType<typeof betterAuth> | null = null;

export function initAuth(client: MongoClient, db: Db): ReturnType<typeof betterAuth> {
  if (authInstance) {
    return authInstance;
  }

  authInstance = betterAuth({
    appName: "TicketFlow",
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [
      process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
      "http://localhost:3000",
      "http://localhost:3002",
    ],
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

/** @deprecated Prefer initAuth() + getAuth() — kept for Better Auth CLI config resolution. */
export const auth = {
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
