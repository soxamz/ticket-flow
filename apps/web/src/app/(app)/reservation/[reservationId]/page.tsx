"use client";

import type { ReservationDetail } from "@repo/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { RainbowButton } from "@repo/ui/components/rainbow-button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle, Clock } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BookingSummaryCard } from "@/components/BookingSummaryCard";
import { BookingSteps } from "@/components/booking/booking-steps";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PageHeader } from "@/components/PageHeader";
import { api, isExpiredError } from "@/lib/api";

function ReservationContent() {
  const params = useParams<{ reservationId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const reservationId = params.reservationId;

  const [reservation, setReservation] = useState<ReservationDetail | null>(
    null,
  );
  const [expiresAt, setExpiresAt] = useState<string | null>(
    searchParams.get("expiresAt"),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadReservation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReservation(reservationId);
      setReservation(data);
      setExpiresAt(data.expiresAt);
      if (new Date(data.expiresAt).getTime() <= Date.now()) {
        setExpired(true);
      }
    } catch {
      setError("Failed to load reservation.");
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    if (!expiresAt) {
      loadReservation();
    } else {
      setLoading(false);
      if (new Date(expiresAt).getTime() <= Date.now()) {
        setExpired(true);
      }
      loadReservation();
    }
  }, [expiresAt, loadReservation]);

  async function handleConfirm() {
    if (expired) {
      return;
    }

    setConfirming(true);
    try {
      const booking = await api.confirmBooking(reservationId);
      router.push(`/booking/${booking.bookingId}`);
    } catch (err) {
      if (isExpiredError(err)) {
        setExpired(true);
        router.push(`/booking/${reservationId}?expired=1`);
      } else {
        toast.error("Booking failed", {
          description:
            err instanceof Error
              ? err.message
              : "Try confirming again or choose different seats.",
        });
      }
    } finally {
      setConfirming(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await api.cancelReservation(reservationId);
      router.push("/");
    } catch {
      toast.error("Failed to cancel reservation", {
        description: "Refresh the page and try again.",
      });
    } finally {
      setCancelling(false);
    }
  }

  if (loading && !reservation) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !reservation || !expiresAt) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error ?? "Reservation not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-8">
      <BookingSteps current="hold" />

      <PageHeader
        title="Hold seats"
        description="Review your selection and confirm before the timer runs out."
      />

      <Card className="overflow-hidden border-primary/25 bg-linear-to-b from-primary/10 via-card to-violet-950/20 shadow-sm">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="size-4 shrink-0" aria-hidden />
            <CardTitle className="font-medium text-base">
              Time remaining
            </CardTitle>
          </div>
          <CardDescription>
            Your seats are held temporarily while you complete checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8">
          <CountdownTimer
            expiresAt={expiresAt}
            onExpire={() => setExpired(true)}
          />
        </CardContent>
      </Card>

      {expired ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Reservation expired</AlertTitle>
          <AlertDescription>
            Your hold has expired. Return to the event page to select seats
            again.
          </AlertDescription>
        </Alert>
      ) : null}

      <BookingSummaryCard
        eventName={reservation.event.name}
        eventDate={reservation.event.date}
        venue={reservation.event.venue}
        seatNumbers={reservation.seatNumbers}
      />

      <Card className="border-primary/20 bg-linear-to-r from-primary/10 via-card to-violet-950/20 shadow-sm">
        <CardContent className="flex flex-col gap-3 py-4">
          <RainbowButton
            onClick={handleConfirm}
            disabled={expired || confirming}
            size="lg"
            className="w-full"
          >
            {confirming ? "Confirming…" : "Confirm booking"}
          </RainbowButton>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full"
          >
            {cancelling ? "Cancelling…" : "Release seats"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReservationPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      }
    >
      <ReservationContent />
    </Suspense>
  );
}
