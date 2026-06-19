"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useRouter } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

export default function AdminCreateEventPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create event"
        description="Add a new event and auto-generate seats"
      />
      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            submitLabel="Create event"
            onSubmit={async (values) => {
              const event = await api.createAdminEvent(values);
              router.push(`/admin/events/${event._id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
