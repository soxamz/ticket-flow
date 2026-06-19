"use client";

import type { AdminBooking, AdminUser, Event, Seat } from "@repo/types";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EventBookingsPanel } from "@/components/admin/event-bookings-panel";
import { EventForm } from "@/components/admin/event-form";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

export default function AdminEventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;

  const [event, setEvent] = useState<Event | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [events, adminUsers, eventBookings, eventSeats] =
          await Promise.all([
            api.getAdminEvents(),
            api.getAdminUsers(),
            api.getAdminEventBookings(eventId),
            api.getAdminEventSeats(eventId),
          ]);

        if (!cancelled) {
          setEvent(events.find((item) => item._id === eventId) ?? null);
          setUsers(adminUsers);
          setBookings(eventBookings);
          setSeats(eventSeats);
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
  }, [eventId]);

  async function handleDelete() {
    if (!confirm("Delete this event and all related bookings?")) {
      return;
    }

    await api.deleteAdminEvent(eventId);
    router.push("/admin/events");
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading event...</p>;
  }

  if (!event) {
    return <p className="text-muted-foreground">Event not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title={event.name}
          description="Update event details and manage bookings"
        />
        <Button variant="destructive" onClick={handleDelete}>
          Delete event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            submitLabel="Save changes"
            defaultValues={{
              name: event.name,
              date: event.date,
              venue: event.venue,
              city: event.city,
              category: event.category,
              totalSeats: event.totalSeats,
              description: event.description,
              imageUrl: event.imageUrl,
              featured: event.featured,
            }}
            onSubmit={async (values) => {
              const updated = await api.updateAdminEvent(eventId, values);
              setEvent(updated);
            }}
          />
        </CardContent>
      </Card>

      <EventBookingsPanel
        eventId={eventId}
        users={users}
        initialBookings={bookings}
        initialSeats={seats}
      />
    </div>
  );
}
