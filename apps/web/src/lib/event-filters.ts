import type { Event } from "@repo/types";

export type EventFilterState = {
  query: string;
  category: "all" | string;
  city: "all" | string;
  featuredOnly: boolean;
};

export function getEventCategories(events: Event[]): string[] {
  return [
    ...new Set(events.map((event) => event.category).filter(Boolean)),
  ].sort();
}

export function getEventCities(events: Event[]): string[] {
  return [...new Set(events.map((event) => event.city).filter(Boolean))].sort();
}

export function filterEvents(
  events: Event[],
  filters: EventFilterState,
): Event[] {
  return events.filter((event) => {
    if (filters.featuredOnly && !event.featured) {
      return false;
    }

    if (filters.category !== "all" && event.category !== filters.category) {
      return false;
    }

    if (filters.city !== "all" && event.city !== filters.city) {
      return false;
    }

    if (filters.query) {
      const query = filters.query.toLowerCase();
      const haystack = [
        event.name,
        event.venue,
        event.city,
        event.category,
        event.description ?? "",
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export function formatEventDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
