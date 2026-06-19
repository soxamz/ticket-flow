import { createAuthClient } from "better-auth/react";

export const BEARER_TOKEN_KEY = "bearer_token";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    credentials: "include",
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken) {
        localStorage.setItem(BEARER_TOKEN_KEY, authToken);
      }
    },
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
