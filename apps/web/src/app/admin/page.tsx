"use client";

import type { AdminStats } from "@repo/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { CalendarDays, Ticket, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await api.getAdminStats();
        if (!cancelled) {
          setStats(data);
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
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin dashboard"
        description="Manage events, users, and bookings"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-medium text-sm">Events</CardTitle>
                <CalendarDays className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-3xl">
                  {stats?.eventCount ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-medium text-sm">Users</CardTitle>
                <Users className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-3xl">
                  {stats?.userCount ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-medium text-sm">Bookings</CardTitle>
                <Ticket className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-3xl">
                  {stats?.bookingCount ?? 0}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
