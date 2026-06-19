import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { SEAT_PRICE } from "@/lib/api";
import { formatEventDate } from "@/lib/event-filters";
import { formatCurrency } from "@/lib/format";
import { compareSeatNumbers } from "@/lib/seat-layout";

interface BookingSummaryCardProps {
  eventName: string;
  eventDate: string;
  venue: string;
  seatNumbers: string[];
  className?: string;
}

export function BookingSummaryCard({
  eventName,
  eventDate,
  venue,
  seatNumbers,
  className,
}: BookingSummaryCardProps) {
  const sortedSeats = [...seatNumbers].sort(compareSeatNumbers);
  const total = sortedSeats.length * SEAT_PRICE;

  return (
    <Card
      className={cn(
        "border-primary/20 bg-linear-to-br from-primary/10 via-card to-violet-950/25 shadow-sm",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Ticket className="size-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-balance text-lg">{eventName}</CardTitle>
            <p className="text-muted-foreground text-sm">
              {sortedSeats.length} {sortedSeats.length === 1 ? "seat" : "seats"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2 text-muted-foreground">
          <p className="flex items-start gap-2">
            <CalendarDays
              className="mt-0.5 size-4 shrink-0 text-primary/80"
              aria-hidden
            />
            <span>{formatEventDate(eventDate)}</span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-primary/80"
              aria-hidden
            />
            <span className="break-words">{venue}</span>
          </p>
        </div>

        <Separator className="bg-border/60" />

        <div className="space-y-2">
          <p className="font-medium text-foreground text-xs tracking-wide uppercase">
            Your seats
          </p>
          <div className="flex flex-wrap gap-2">
            {sortedSeats.map((seat) => (
              <Badge
                key={seat}
                variant="secondary"
                className="font-mono tabular-nums"
                translate="no"
              >
                {seat}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-border/60" />

        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold text-base tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
