"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_URL, authClient, BEARER_TOKEN_KEY } from "@/lib/auth-client";

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
  const [fallbackUser, setFallbackUser] = useState<AuthState | null>(null);
  const [isFallbackLoading, setIsFallbackLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBearerSession() {
      if (typeof window === "undefined") {
        return;
      }

      const token = localStorage.getItem(BEARER_TOKEN_KEY);
      if (!token) {
        setFallbackUser(null);
        return;
      }

      setIsFallbackLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/auth/get-session`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as {
          user?: {
            id: string;
            email: string;
            name: string;
            createdAt?: string | Date;
            role?: string;
          };
        } | null;

        if (!response.ok || !data?.user) {
          if (!cancelled) {
            setFallbackUser(null);
          }
          return;
        }

        if (!cancelled) {
          setFallbackUser({
            userId: data.user.id,
            email: data.user.email,
            name: data.user.name,
            createdAt:
              typeof data.user.createdAt === "string"
                ? data.user.createdAt
                : data.user.createdAt instanceof Date
                  ? data.user.createdAt.toISOString()
                  : null,
            role: data.user.role === "admin" ? "admin" : "user",
          });
        }
      } catch {
        if (!cancelled) {
          setFallbackUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsFallbackLoading(false);
        }
      }
    }

    if (!isPending && !session?.user) {
      loadBearerSession();
      return;
    }

    setFallbackUser(null);
    setIsFallbackLoading(false);

    return () => {
      cancelled = true;
    };
  }, [isPending, session]);

  const user = useMemo<AuthState | null>(() => {
    if (!session?.user) {
      return fallbackUser;
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
  }, [session, fallbackUser]);

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
    setFallbackUser(null);
    await authClient.signOut();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading: isPending || isFallbackLoading,
      login,
      register,
      logout,
    }),
    [user, isPending, isFallbackLoading, login, register, logout],
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
