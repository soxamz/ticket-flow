"use client";

import type { BookingDetail } from "@repo/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Confetti, type ConfettiRef } from "@repo/ui/components/confetti";
import { RainbowButton } from "@repo/ui/components/rainbow-button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { BookingSummaryCard } from "@/components/BookingSummaryCard";
import { BookingSteps } from "@/components/booking/booking-steps";
import { DownloadTicketButton } from "@/components/booking/download-ticket-button";
import { api } from "@/lib/api";
import { formatBookedAt } from "@/lib/format";

function BookingContent() {
  const params = useParams<{ bookingId: string }>();
  const searchParams = useSearchParams();
  const bookingId = params.bookingId;
  const isExpiredFlow = searchParams.get("expired") === "1";

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(!isExpiredFlow);
  const [error, setError] = useState<string | null>(null);
  const confettiRef = useRef<ConfettiRef>(null);
  const hasCelebratedRef = useRef(false);

  useEffect(() => {
    if (isExpiredFlow) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const data = await api.getBooking(bookingId);
        if (!cancelled) {
          setBooking(data);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load booking details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [bookingId, isExpiredFlow]);

  useEffect(() => {
    if (isExpiredFlow || loading || !booking || hasCelebratedRef.current) {
      return;
    }

    hasCelebratedRef.current = true;

    const count = 200;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 100,
      colors: ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"],
    };

    const fire = (particleRatio: number, options: Record<string, number>) => {
      confettiRef.current?.fire({
        ...defaults,
        ...options,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    const timeline = [
      () => {
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
      },
      () => {
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      },
      () => {
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      },
    ];

    const timers = timeline.map((burst, index) =>
      window.setTimeout(burst, index * 220),
    );

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [booking, loading, isExpiredFlow]);

  if (isExpiredFlow) {
    return (
      <div className="mx-auto max-w-xl space-y-6 pb-8">
        <BookingSteps current="hold" />

        <Card className="border-destructive/30 bg-linear-to-b from-destructive/10 via-card to-card">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/15 ring-4 ring-destructive/20">
              <AlertCircle className="size-8 text-destructive" aria-hidden />
            </div>
            <div className="space-y-2">
              <h1 className="text-balance font-semibold text-2xl">
                Seats no longer available
              </h1>
              <p className="text-muted-foreground text-sm">
                Your reservation expired before checkout finished. Those seats
                may already be open for other guests.
              </p>
            </div>
          </CardContent>
        </Card>

        <RainbowButton asChild size="lg" className="w-full">
          <Link href="/dashboard">Choose different seats</Link>
        </RainbowButton>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error ?? "Booking not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-8">
      <Confetti
        ref={confettiRef}
        manualstart
        className="pointer-events-none fixed inset-0 z-50 size-full"
      />

      <BookingSteps current="confirm" />

      <Card className="overflow-hidden border-primary/25 bg-linear-to-br from-primary/15 via-card to-violet-950/30 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/15 ring-4 ring-primary/20">
            <CheckCircle2 className="size-8 text-primary" aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="text-balance font-semibold text-2xl tracking-tight">
              Booking confirmed
            </h1>
            <p className="text-muted-foreground text-sm">
              Reference{" "}
              <span
                className="font-mono text-foreground tabular-nums"
                translate="no"
              >
                {bookingId}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <BookingSummaryCard
        eventName={booking.event.name}
        eventDate={booking.event.date}
        venue={booking.event.venue}
        seatNumbers={booking.seatNumbers}
      />

      <Card className="border-border/60 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ticket details</CardTitle>
          <CardDescription>
            Booked on {formatBookedAt(booking.bookedAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Show this confirmation or your downloaded PDF at the venue entrance.
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-linear-to-r from-primary/10 via-card to-violet-950/20 shadow-sm">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row">
          <DownloadTicketButton bookingId={bookingId} />
          <RainbowButton asChild size="lg" className="flex-1">
            <Link href="/dashboard">Back to events</Link>
          </RainbowButton>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
