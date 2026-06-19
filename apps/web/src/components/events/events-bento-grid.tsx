import type { Event } from "@repo/types";
import { AnimatedGroup } from "@repo/ui/components/animated-group";
import { EventCard } from "@/components/events/event-card";

interface EventsBentoGridProps {
  events: Event[];
}

export function EventsBentoGrid({ events }: EventsBentoGridProps) {
  return (
    <AnimatedGroup
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={{
        container: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        },
        item: {
          hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
          visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
              duration: 1.2,
              type: "spring",
              bounce: 0.3,
            },
          },
        },
      }}
    >
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </AnimatedGroup>
  );
}
