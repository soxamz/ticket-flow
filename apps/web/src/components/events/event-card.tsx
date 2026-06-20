import type { Event } from "@repo/types";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { formatEventDate } from "@/lib/event-filters";

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  return (
    <Link
      href={`/events/${event._id}`}
      className={cn(
        "group relative block aspect-[3/4] overflow-hidden rounded-xl shadow-sm",
        className,
      )}
    >
      {event.imageUrl ? (
        <Image
          src={event.imageUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" aria-hidden />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10"
        aria-hidden
      />
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{event.category}</Badge>
          {event.featured ? <Badge>Featured</Badge> : null}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 font-semibold text-lg text-white">
            {event.name}
          </h3>
          <p className="text-sm text-white/80">
            {formatEventDate(event.date)} · {event.city}
          </p>
          <p className="text-sm text-white/70">{event.venue}</p>
          <p className="font-medium text-sm text-white/90">
            {event.availableSeats} seats left
          </p>
        </div>
      </div>
    </Link>
  );
}
