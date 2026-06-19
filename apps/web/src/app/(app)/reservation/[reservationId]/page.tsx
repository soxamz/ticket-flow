"use client";

import type { ReservationDetail } from "@repo/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle, Clock } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BookingSummaryCard } from "@/components/BookingSummaryCard";
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
          description: err instanceof Error ? err.message : "Please try again",
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
      toast.error("Failed to cancel reservation");
    } finally {
      setCancelling(false);
    }
  }

  if (loading && !reservation) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="mx-auto h-16 w-32" />
        <Skeleton className="h-40 w-full" />
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
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Hold Seats"
        description="Complete your booking before the timer expires"
      />

      <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 text-center">
        <Clock className="size-5 text-muted-foreground" />
        <CountdownTimer
          expiresAt={expiresAt}
          onExpire={() => setExpired(true)}
        />
      </div>

      {expired ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Reservation expired</AlertTitle>
          <AlertDescription>
            Your hold has expired. Please select seats again.
          </AlertDescription>
        </Alert>
      ) : null}

      <BookingSummaryCard
        eventName={reservation.event.name}
        eventDate={reservation.event.date}
        venue={reservation.event.venue}
        seatNumbers={reservation.seatNumbers}
      />

      <Separator />

      <div className="flex flex-col gap-3">
        <Button
          onClick={handleConfirm}
          disabled={expired || confirming}
          size="lg"
          className="w-full"
        >
          {confirming ? "Confirming..." : "Confirm Booking"}
        </Button>
        <Button
          variant="ghost"
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full"
        >
          {cancelling ? "Cancelling..." : "Cancel reservation"}
        </Button>
      </div>
    </div>
  );
}

export default function ReservationPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-40 max-w-lg" />}>
      <ReservationContent />
    </Suspense>
  );
}
