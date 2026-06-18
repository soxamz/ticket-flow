import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1">
      <h1 className="text-2xl font-bold mb-4">Next Turbo Starter</h1>
      <p className="text-fd-muted-foreground">
        A production-ready Turborepo monorepo template.{" "}
        <Link href="/docs" className="font-medium underline">
          Read the documentation →
        </Link>
      </p>
    </div>
  );
}
