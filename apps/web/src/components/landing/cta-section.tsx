import { ShimmerButton } from "@repo/ui/components/shimmer-button";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
          Ready to secure your tickets?
        </h2>
        <p className="text-xl text-muted-foreground mb-10 text-balance">
          Join thousands of users who trust TicketFlow for their event experiences.
        </p>
        
        <Link href="/register" className="inline-block">
          <ShimmerButton className="shadow-2xl" shimmerSize="0.1em">
            <span className="whitespace-pre-wrap text-center text-sm font-semibold leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
              Create Free Account
            </span>
          </ShimmerButton>
        </Link>
      </div>
    </section>
  );
}
