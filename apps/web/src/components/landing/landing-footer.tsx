import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-card py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="TicketFlow"
              width={24}
              height={24}
              className="size-6 grayscale opacity-80"
            />
            <span className="font-semibold text-muted-foreground">TicketFlow</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Browse Events</Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground/60">
          <p>© {new Date().getFullYear()} TicketFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
