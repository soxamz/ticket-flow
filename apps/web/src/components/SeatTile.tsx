"use client";

import { Toggle } from "@repo/ui/components/toggle";
import { cn } from "@repo/ui/lib/utils";

interface SeatTileProps {
  seatNumber: string;
  status: "available" | "reserved" | "booked";
  isSelected?: boolean;
  onClick?: () => void;
}

export function SeatTile({
  seatNumber,
  status,
  isSelected = false,
  onClick,
}: SeatTileProps) {
  const isUnavailable = status !== "available";

  if (isUnavailable) {
    return (
      <Toggle
        variant="outline"
        size="sm"
        pressed={false}
        disabled
        className={cn(
          "size-10 min-w-10 cursor-not-allowed font-mono text-xs opacity-60",
          status === "booked" && "border-destructive/40 text-destructive",
          status === "reserved" &&
            "border-muted-foreground/40 text-muted-foreground",
        )}
        aria-label={`Seat ${seatNumber} ${status}`}
      >
        {seatNumber}
      </Toggle>
    );
  }

  return (
    <Toggle
      variant="outline"
      size="sm"
      pressed={isSelected}
      onPressedChange={() => onClick?.()}
      className="size-10 min-w-10 font-mono text-xs data-[state=on]:border-primary"
      aria-label={`Seat ${seatNumber}`}
    >
      {seatNumber}
    </Toggle>
  );
}
