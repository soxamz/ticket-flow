"use client";

import type { Seat } from "@repo/types";
import { DoorOpen } from "lucide-react";
import { useMemo } from "react";
import { SeatTile } from "@/components/SeatTile";
import {
  buildSeatLayout,
  ROW_SPACING,
  SCHEMATIC_SCALE,
  SEAT_SPACING,
} from "@/lib/seat-layout";

interface SeatMap2DProps {
  seats: Seat[];
  selected: string[];
  onToggleSeat: (seatNumber: string, status: Seat["status"]) => void;
}

const SCREEN_OFFSET = 1.8;

export function SeatMap2D({ seats, selected, onToggleSeat }: SeatMap2DProps) {
  const layout = useMemo(() => buildSeatLayout(seats), [seats]);

  const auditoriumWidth =
    layout.maxSeatsPerRow * SEAT_SPACING * SCHEMATIC_SCALE + 120;
  const auditoriumHeight =
    (layout.depth + SCREEN_OFFSET + 2) * ROW_SPACING * SCHEMATIC_SCALE + 140;
  const entranceZ = layout.depth + 1.5;

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden rounded-xl border border-border/60 bg-zinc-950">
      <div
        className="relative mx-auto"
        style={{
          width: auditoriumWidth,
          height: auditoriumHeight,
        }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: 24,
            width: layout.maxSeatsPerRow * SEAT_SPACING * SCHEMATIC_SCALE,
          }}
        >
          <div className="h-3 rounded-t-full bg-linear-to-b from-primary/80 to-primary/20 shadow-[0_0_24px_rgba(147,51,234,0.35)]" />
          <div className="mx-auto mt-1 h-1 w-4/5 rounded-full bg-primary/40 blur-sm" />
          <p className="text-muted-foreground mt-2 text-center text-xs font-medium tracking-widest uppercase">
            Screen
          </p>
        </div>

        {layout.seats.map(({ seat, position }) => (
          <div
            key={seat._id ?? seat.seatNumber}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `calc(50% + ${position.x * SCHEMATIC_SCALE}px)`,
              top: `${(position.z + SCREEN_OFFSET + 1.2) * ROW_SPACING * SCHEMATIC_SCALE}px`,
            }}
          >
            <SeatTile
              seatNumber={seat.seatNumber}
              status={seat.status}
              isSelected={selected.includes(seat.seatNumber)}
              onClick={() => onToggleSeat(seat.seatNumber, seat.status)}
            />
          </div>
        ))}

        <div
          className="text-muted-foreground absolute flex items-center gap-1.5 text-xs"
          style={{
            left: `calc(50% - ${5.5 * SCHEMATIC_SCALE}px)`,
            top: `${(entranceZ + SCREEN_OFFSET + 0.5) * ROW_SPACING * SCHEMATIC_SCALE}px`,
          }}
        >
          <DoorOpen className="size-3.5" />
          <span>Entrance A</span>
        </div>
        <div
          className="text-muted-foreground absolute flex items-center gap-1.5 text-xs"
          style={{
            left: `calc(50% + ${5.5 * SCHEMATIC_SCALE}px)`,
            top: `${(entranceZ + SCREEN_OFFSET + 0.5) * ROW_SPACING * SCHEMATIC_SCALE}px`,
          }}
        >
          <span>Entrance B</span>
          <DoorOpen className="size-3.5" />
        </div>
      </div>
    </div>
  );
}
