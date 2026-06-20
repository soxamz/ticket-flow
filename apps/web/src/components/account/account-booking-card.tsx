import type { UserBooking } from "@repo/types";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { CalendarDays, ChevronRight, MapPin, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SEAT_PRICE } from "@/lib/api";
import { formatEventDate } from "@/lib/event-filters";
import { formatBookedAt, formatCurrency } from "@/lib/format";
import { compareSeatNumbers } from "@/lib/seat-layout";

interface AccountBookingCardProps {
  booking: UserBooking;
}

export function AccountBookingCard({ booking }: AccountBookingCardProps) {
  const sortedSeats = [...booking.seatNumbers].sort(compareSeatNumbers);
  const total = sortedSeats.length * SEAT_PRICE;

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 transition-colors hover:border-primary/30">
      <Link href={`/booking/${booking._id}`} className="block">
        <div className="flex flex-col sm:flex-row">
          {booking.event.imageUrl ? (
            <div className="relative aspect-[16/9] w-full shrink-0 sm:aspect-auto sm:h-auto sm:w-40">
              <Image
                src={booking.event.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 160px"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] w-full shrink-0 items-center justify-center bg-muted sm:aspect-auto sm:h-auto sm:w-40">
              <Ticket className="size-8 text-muted-foreground/60" aria-hidden />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-balance text-lg">
                    {booking.event.name}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{booking.event.category}</Badge>
                    <span className="text-muted-foreground text-xs">
                      Booked {formatBookedAt(booking.bookedAt)}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className="mt-1 size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-4 text-sm">
              <div className="space-y-1.5 text-muted-foreground">
                <p className="flex items-start gap-2">
                  <CalendarDays
                    className="mt-0.5 size-4 shrink-0 text-primary/80"
                    aria-hidden
                  />
                  {formatEventDate(booking.event.date)}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-primary/80"
                    aria-hidden
                  />
                  {booking.event.venue}, {booking.event.city}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <p className="text-muted-foreground">
                  {sortedSeats.length}{" "}
                  {sortedSeats.length === 1 ? "seat" : "seats"} ·{" "}
                  <span className="font-mono text-foreground">
                    {sortedSeats.join(", ")}
                  </span>
                </p>
                <p className="font-semibold text-primary tabular-nums">
                  {formatCurrency(total)}
                </p>
              </div>
            </CardContent>
          </div>
        </div>
      </Link>
    </Card>
  );
}
