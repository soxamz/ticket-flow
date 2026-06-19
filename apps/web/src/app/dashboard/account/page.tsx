"use client";

import type { UserBooking } from "@repo/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle, CalendarSearch, Mail, Shield, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AccountBookingCard } from "@/components/account/account-booking-card";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatMemberSince } from "@/lib/format";

function getInitials(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function AccountPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      try {
        setLoadingBookings(true);
        setError(null);
        const data = await api.getMyBookings();
        if (!cancelled) {
          setBookings(data);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load your bookings.");
        }
      } finally {
        if (!cancelled) {
          setLoadingBookings(false);
        }
      }
    }

    if (!authLoading && user) {
      loadBookings();
    }

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const initials = useMemo(
    () => (user ? getInitials(user.name, user.email) : ""),
    [user],
  );

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <PageHeader
        title="Account"
        description="Your profile and event bookings"
      />

      <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 via-card to-violet-950/25 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your TicketFlow account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 border border-primary/20 bg-primary/10">
              <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <p className="truncate font-semibold text-lg">{user.name}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                >
                  {user.role === "admin" ? "Admin" : "Member"}
                </Badge>
                {user.createdAt ? (
                  <span className="text-muted-foreground text-xs">
                    Since {formatMemberSince(user.createdAt)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <Separator />

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                <Mail className="size-3.5" aria-hidden />
                Email
              </dt>
              <dd className="truncate font-medium text-sm">{user.email}</dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                <User className="size-3.5" aria-hidden />
                User ID
              </dt>
              <dd
                className="truncate font-mono text-foreground/80 text-xs"
                translate="no"
              >
                {user.userId}
              </dd>
            </div>
            {user.role === "admin" ? (
              <div className="space-y-1 sm:col-span-2">
                <dt className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <Shield className="size-3.5" aria-hidden />
                  Admin access
                </dt>
                <dd>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin">Open admin dashboard</Link>
                  </Button>
                </dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-semibold text-xl tracking-tight">
              Your events
            </h2>
            <p className="text-muted-foreground text-sm">
              {loadingBookings
                ? "Loading bookings…"
                : `${bookings.length} confirmed booking${bookings.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {loadingBookings ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <AccountBookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarSearch />
              </EmptyMedia>
              <EmptyTitle>No bookings yet</EmptyTitle>
              <EmptyDescription>
                When you confirm seats for an event, your tickets will show up
                here.
              </EmptyDescription>
            </EmptyHeader>
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Browse events</Link>
            </Button>
          </Empty>
        )}
      </section>
    </div>
  );
}
