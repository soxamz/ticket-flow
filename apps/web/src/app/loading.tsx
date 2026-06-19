import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border bg-card/80 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        Loading TicketFlow...
      </div>
    </div>
  );
}
