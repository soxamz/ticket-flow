"use client";

import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/events", label: "Events", exact: false },
  { href: "/admin/users", label: "Users", exact: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="TicketFlow"
                width={28}
                height={28}
                className="size-7"
              />
              <span className="font-semibold text-base">Admin</span>
            </Link>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV_ITEMS.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Button
                    key={item.href}
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                );
              })}
            </nav>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Back to app</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <nav className="mb-6 flex gap-2 sm:hidden">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </main>
    </div>
  );
}
