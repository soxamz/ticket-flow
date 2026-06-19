"use client";

import type { BookingDetail } from "@repo/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BookingSummaryCard } from "@/components/BookingSummaryCard";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

function BookingContent() {
  const params = useParams<{ bookingId: string }>();
  const searchParams = useSearchParams();
  const bookingId = params.bookingId;
  const isExpiredFlow = searchParams.get("expired") === "1";

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(!isExpiredFlow);
  const [error, setError] = useState<string | null>(null);

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

  if (isExpiredFlow) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Seats no longer available</AlertTitle>
          <AlertDescription>
            Your reservation expired before the booking could be confirmed. The
            seats may have been released back to other users.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full" size="lg">
          <Link href="/">Choose different seats</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="mx-auto size-16 rounded-full" />
        <Skeleton className="h-40 w-full" />
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
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="size-16 text-primary" />
        <PageHeader
          title="Booking confirmed"
          description={`Reference: ${bookingId}`}
        />
      </div>

      <BookingSummaryCard
        eventName={booking.event.name}
        eventDate={booking.event.date}
        venue={booking.event.venue}
        seatNumbers={booking.seatNumbers}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ticket details</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Booked on{" "}
          {new Date(booking.bookedAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" disabled className="flex-1">
          Download ticket
        </Button>
        <Button asChild className="flex-1">
          <Link href="/">Back to events</Link>
        </Button>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-40 max-w-lg" />}>
      <BookingContent />
    </Suspense>
  );
}
