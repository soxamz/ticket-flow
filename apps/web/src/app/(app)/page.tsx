"use client";

import type { Event } from "@repo/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle, CalendarSearch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EventsBentoGrid } from "@/components/events/events-bento-grid";
import { EventsFilters } from "@/components/events/events-filters";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { type EventFilterState, filterEvents } from "@/lib/event-filters";

const INITIAL_FILTERS: EventFilterState = {
  query: "",
  category: "all",
  city: "all",
  featuredOnly: false,
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftQuery, setDraftQuery] = useState("");
  const [filters, setFilters] = useState<EventFilterState>(INITIAL_FILTERS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getEvents();
        if (!cancelled) {
          setEvents(data);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load events. Please try again.");
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

  const filteredEvents = useMemo(
    () => filterEvents(events, filters),
    [events, filters],
  );

  function handleSearch() {
    setFilters((current: EventFilterState) => ({
      ...current,
      query: draftQuery.trim(),
    }));
  }

  function handleClearFilters() {
    setDraftQuery("");
    setFilters(INITIAL_FILTERS);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((key) => (
            <Skeleton key={key} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Explore Events"
        description="Browse upcoming events and select your seats"
      />
      <EventsFilters
        events={events}
        draftQuery={draftQuery}
        filters={filters}
        onDraftQueryChange={setDraftQuery}
        onSearch={handleSearch}
        onFiltersChange={setFilters}
        onClear={handleClearFilters}
      />
      {filteredEvents.length > 0 ? (
        <EventsBentoGrid events={filteredEvents} />
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarSearch />
            </EmptyMedia>
            <EmptyTitle>No events match your filters</EmptyTitle>
            <EmptyDescription>
              Try a different search term or clear your filters to see all
              events.
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" variant="outline" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </Empty>
      )}
    </div>
  );
}
