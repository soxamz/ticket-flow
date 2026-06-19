"use client";

import type { Event } from "@repo/types";
import { Button } from "@repo/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import {
  type EventFilterState,
  getEventCategories,
  getEventCities,
} from "@/lib/event-filters";

interface EventsFiltersProps {
  events: Event[];
  draftQuery: string;
  filters: EventFilterState;
  onDraftQueryChange: (value: string) => void;
  onSearch: () => void;
  onFiltersChange: (filters: EventFilterState) => void;
  onClear: () => void;
}

export function EventsFilters({
  events,
  draftQuery,
  filters,
  onDraftQueryChange,
  onSearch,
  onFiltersChange,
  onClear,
}: EventsFiltersProps) {
  const categories = getEventCategories(events);
  const cities = getEventCities(events);

  return (
    <div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <FieldGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field className="lg:col-span-2">
            <FieldLabel htmlFor="event-search">Search</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="event-search"
                value={draftQuery}
                onChange={(event) => onDraftQueryChange(event.target.value)}
                placeholder="Search events, venues, cities..."
              />
              <Button type="submit">Search</Button>
            </div>
          </Field>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, category: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>City</FieldLabel>
            <Select
              value={filters.city}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, city: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field orientation="horizontal">
            <Switch
              id="featured-only"
              checked={filters.featuredOnly}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, featuredOnly: checked })
              }
            />
            <FieldLabel htmlFor="featured-only">Featured only</FieldLabel>
          </Field>
        </FieldGroup>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClear}>
            Clear filters
          </Button>
        </div>
      </form>
    </div>
  );
}
