"use client";

import type { EventDetail, Seat } from "@repo/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StickyActionBar } from "@/components/StickyActionBar";
import { SeatMap } from "@/components/seats/seat-map";
import { SeatMapLegend } from "@/components/seats/seat-map-legend";
import { api, isReserveConflict, SEAT_PRICE } from "@/lib/api";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventData, seatData] = await Promise.all([
        api.getEvent(eventId),
        api.getEventSeats(eventId),
      ]);
      setEvent(eventData);
      setSeats(seatData);
    } catch {
      setError("Failed to load event details.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const total = useMemo(() => selected.length * SEAT_PRICE, [selected.length]);

  function toggleSeat(seatNumber: string, status: Seat["status"]) {
    if (status !== "available") {
      return;
    }

    setSelected((current) =>
      current.includes(seatNumber)
        ? current.filter((s) => s !== seatNumber)
        : [...current, seatNumber],
    );
  }

  async function handleReserve() {
    if (selected.length === 0) {
      return;
    }

    setReserving(true);
    try {
      const response = await api.reserve(eventId, selected);
      router.push(
        `/dashboard/reservation/${response.reservationId}?expiresAt=${encodeURIComponent(response.expiresAt)}`,
      );
    } catch (err) {
      if (isReserveConflict(err)) {
        const failed = err.data.failedSeats;
        toast.error("Seats unavailable", {
          description: `These seats are no longer available: ${failed.join(", ")}`,
        });
        setSelected((current) => current.filter((s) => !failed.includes(s)));
        await loadData();
      } else {
        toast.error("Reservation failed", {
          description: err instanceof Error ? err.message : "Please try again",
        });
      }
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-[min(62vh,520px)] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error ?? "Event not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={event.name} description={event.venue} />

      <SeatMapLegend />
      <SeatMap seats={seats} selected={selected} onToggleSeat={toggleSeat} />

      <StickyActionBar
        summary={
          <>
            <p className="font-medium">
              {selected.length} seat{selected.length === 1 ? "" : "s"} selected
            </p>
            <p className="text-muted-foreground">
              Total: ₹{total.toLocaleString("en-IN")}
            </p>
          </>
        }
        actionLabel="Reserve Seats"
        onAction={handleReserve}
        disabled={selected.length === 0}
        loading={reserving}
      />
    </div>
  );
}
