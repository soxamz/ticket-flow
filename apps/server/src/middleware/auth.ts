import { getAuth } from "@repo/auth";
import type { NextFunction, Request, Response } from "express";
import { toRequestHeaders } from "../lib/headers.js";

export interface AuthUser {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function getUserRole(user: Record<string, unknown>): string {
  return typeof user.role === "string" ? user.role : "user";
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await getAuth().api.getSession({
      headers: toRequestHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.user = {
      userId: session.user.id,
      role: getUserRole(session.user as Record<string, unknown>),
    };
    next();
  } catch (error) {
    next(error);
  }
}

export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await getAuth().api.getSession({
      headers: toRequestHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const role = getUserRole(session.user as Record<string, unknown>);
    req.user = {
      userId: session.user.id,
      role,
    };

    if (role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
