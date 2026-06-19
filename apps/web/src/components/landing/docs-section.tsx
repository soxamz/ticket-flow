import { Button } from "@repo/ui/components/button";
import { BookOpenText, FileCode2, Route } from "lucide-react";
import Link from "next/link";
import { DOCS_URL } from "@/lib/docs-url";

const docHighlights = [
  {
    title: "Architecture Overview",
    description:
      "Understand how frontend, backend, auth, and shared packages work together.",
    href: `${DOCS_URL}docs/project-structure`,
    icon: FileCode2,
  },
  {
    title: "Routes and Flows",
    description:
      "Follow booking, reservation, account, and admin workflows end-to-end.",
    href: `${DOCS_URL}docs/routes-and-flows`,
    icon: Route,
  },
];

export function DocsSection() {
  return (
    <section id="docs" className="py-24 bg-muted/20 border-y border-border/40">
      <div className="container mx-auto max-w-6xl px-4 space-y-10">
        <div className="space-y-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary text-xs font-medium uppercase tracking-wide">
            <BookOpenText className="size-3.5" aria-hidden />
            Developer docs
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Learn how TicketFlow works under the hood
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Explore architecture, backend APIs, frontend route groups, and
            booking lifecycle documentation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {docHighlights.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="space-y-3">
                <item.icon
                  className="size-5 text-primary transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center">
          <Button asChild className="rounded-full px-6">
            <Link href={DOCS_URL} target="_blank" rel="noreferrer">
              Open Documentation
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
