import { Button } from "@repo/ui/components/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          Turborepo + Next.js + Bun + shadcn/ui
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Next Turbo Starter
        </h1>
        <p className="max-w-[42rem] text-muted-foreground sm:text-lg">
          A clean, modern, production-ready monorepo template. Clone it,
          customize it, and start building your next project immediately.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <a
            href={
              process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3001/docs"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the Docs
          </a>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com"}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </Button>
      </div>

      <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        <FeatureCard
          title="Turborepo"
          description="Incremental builds, parallel execution, and smart caching out of the box."
        />
        <FeatureCard
          title="Next.js 16"
          description="App Router, React Compiler, Server Components, and the latest React 19."
        />
        <FeatureCard
          title="shadcn/ui"
          description="Beautiful, accessible components shared across all apps via @repo/ui."
        />
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
