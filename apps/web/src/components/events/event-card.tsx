import type { Event } from "@repo/types";
import { Badge } from "@repo/ui/components/badge";
import { Spotlight } from "@repo/ui/components/spotlight";
import { Tilt } from "@repo/ui/components/tilt";
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
    <Tilt rotationFactor={6} isRevese className={cn("h-full", className)}>
      <Link
        href={`/dashboard/events/${event._id}`}
        className="group relative block h-[28rem] overflow-hidden rounded-xl shadow-xl"
      >
        <Spotlight
          className="z-10 from-white/50 via-white/20 to-white/10 blur-2xl"
          size={260}
          springOptions={{
            stiffness: 26.7,
            damping: 4.1,
            mass: 0.2,
          }}
        />

        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="rounded-xl object-cover transition-all duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 rounded-xl bg-muted" aria-hidden />
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10"
          aria-hidden
        />

        <div className="relative flex h-full flex-col justify-between p-5">
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
    </Tilt>
  );
}
