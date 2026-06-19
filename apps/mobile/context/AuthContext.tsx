import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type AuthSessionUser, api } from "../lib/api";
import { deleteToken, getToken, setToken } from "../lib/storage";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(u: AuthSessionUser): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role === "admin" ? "admin" : "user",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from SecureStore on mount
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const token = await getToken();
        if (!token) return;
        const sessionUser = await api.getSession(token);
        if (!cancelled && sessionUser) {
          setUser(toAuthUser(sessionUser));
        } else if (!cancelled) {
          await deleteToken();
        }
      } catch {
        if (!cancelled) await deleteToken();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token } = await api.signIn(email, password);
    if (token) await setToken(token);
    if (u) setUser(toAuthUser(u));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user: u, token } = await api.signUp(email, password, name);
    if (token) await setToken(token);
    if (u) setUser(toAuthUser(u));
  }, []);

  const logout = useCallback(async () => {
    await api.signOut();
    await deleteToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
