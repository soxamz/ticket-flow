"use client";

import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="TicketFlow"
            width={28}
            height={28}
            className="size-7"
          />
          <span className="font-semibold text-base">TicketFlow</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            {user.role === "admin" ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">Admin</Link>
              </Button>
            ) : null}
            <span className="hidden text-muted-foreground text-sm sm:inline">
              {user.email}
            </span>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
