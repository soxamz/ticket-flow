"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { authClient, BEARER_TOKEN_KEY } from "@/lib/auth-client";

interface AuthState {
  userId: string;
  email: string;
  name: string;
  createdAt: string | null;
  role: "user" | "admin";
}

interface AuthContextValue {
  user: AuthState | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  const user = useMemo<AuthState | null>(() => {
    if (!session?.user) {
      return null;
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      createdAt:
        typeof session.user.createdAt === "string"
          ? session.user.createdAt
          : session.user.createdAt instanceof Date
            ? session.user.createdAt.toISOString()
            : null,
      role:
        (session.user as { role?: string }).role === "admin" ? "admin" : "user",
    };
  }, [session]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      throw new Error(error.message ?? "Sign in failed");
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: email.split("@")[0] || "User",
    });
    if (error) {
      throw new Error(error.message ?? "Registration failed");
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(BEARER_TOKEN_KEY);
    await authClient.signOut();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading: isPending,
      login,
      register,
      logout,
    }),
    [user, isPending, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
