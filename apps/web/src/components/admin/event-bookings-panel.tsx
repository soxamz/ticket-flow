"use client";

import type { AdminBooking, AdminUser, Seat } from "@repo/types";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatEventDate } from "@/lib/event-filters";

interface EventBookingsPanelProps {
  eventId: string;
  users: AdminUser[];
  initialBookings: AdminBooking[];
  initialSeats: Seat[];
}

export function EventBookingsPanel({
  eventId,
  users,
  initialBookings,
  initialSeats,
}: EventBookingsPanelProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [seats, setSeats] = useState(initialSeats);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableSeats = useMemo(
    () => seats.filter((seat) => seat.status === "available"),
    [seats],
  );

  async function handleAssign() {
    if (!selectedUserId || selectedSeats.length === 0) {
      setError("Select a user and at least one available seat.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const booking = await api.assignAdminBooking(eventId, {
        userId: selectedUserId,
        seatNumbers: selectedSeats,
      });

      setBookings((current) => [booking, ...current]);
      setSeats((current) =>
        current.map((seat) =>
          selectedSeats.includes(seat.seatNumber)
            ? { ...seat, status: "booked" as const }
            : seat,
        ),
      );
      setSelectedSeats([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign booking");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(bookingId: string, seatNumbers: string[]) {
    setLoading(true);
    setError(null);

    try {
      await api.removeAdminBooking(bookingId);
      setBookings((current) =>
        current.filter((booking) => booking._id !== bookingId),
      );
      setSeats((current) =>
        current.map((seat) =>
          seatNumbers.includes(seat.seatNumber)
            ? { ...seat, status: "available" as const }
            : seat,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign user to event</CardTitle>
          <CardDescription>
            Book available seats for a user without going through checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>User</FieldLabel>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {users
                      .filter((user) => Boolean(user.id))
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Available seats</FieldLabel>
              {availableSeats.length > 0 ? (
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  value={selectedSeats}
                  onValueChange={setSelectedSeats}
                  className="flex flex-wrap justify-start gap-2"
                >
                  {availableSeats.map((seat) => (
                    <ToggleGroupItem
                      key={seat._id ?? seat.seatNumber}
                      value={seat.seatNumber}
                      className="min-w-12"
                    >
                      {seat.seatNumber}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No available seats for this event.
                </p>
              )}
            </Field>
          </FieldGroup>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button
            type="button"
            onClick={handleAssign}
            disabled={loading || availableSeats.length === 0}
          >
            Assign booking
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current bookings</CardTitle>
          <CardDescription>
            Remove a booking to free seats for this event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking, index) => (
                  <TableRow key={booking._id ?? `${booking.userId}-${index}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{booking.user.name}</span>
                        <span className="text-muted-foreground text-sm">
                          {booking.user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.seatNumbers.join(", ")}</TableCell>
                    <TableCell>{formatEventDate(booking.bookedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={loading}
                        onClick={() =>
                          handleRemove(booking._id, booking.seatNumbers)
                        }
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">
              No bookings yet for this event.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
