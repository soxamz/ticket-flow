"use client";

import type { Seat } from "@repo/types";
import { Skeleton } from "@repo/ui/components/skeleton";
import dynamic from "next/dynamic";
import { Component, useEffect, useState } from "react";
import { SeatMap2D } from "@/components/seats/seat-map-2d";

const SeatMap3D = dynamic(
  () =>
    import("@/components/seats/seat-map-3d").then((module) => module.SeatMap3D),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[min(62vh,520px)] w-full rounded-xl" />
    ),
  },
);

interface SeatMapProps {
  seats: Seat[];
  selected: string[];
  onToggleSeat: (seatNumber: string, status: Seat["status"]) => void;
}

function usePrefer2DSeatMap() {
  const [prefer2D, setPrefer2D] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function update() {
      setPrefer2D(motionQuery.matches);
    }

    update();
    motionQuery.addEventListener("change", update);

    return () => {
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  return prefer2D;
}

class SeatMap3DFallback extends Component<
  SeatMapProps & { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <SeatMap2D
          seats={this.props.seats}
          selected={this.props.selected}
          onToggleSeat={this.props.onToggleSeat}
        />
      );
    }

    return this.props.children;
  }
}

export function SeatMap({ seats, selected, onToggleSeat }: SeatMapProps) {
  const prefer2D = usePrefer2DSeatMap();

  if (prefer2D) {
    return (
      <SeatMap2D
        seats={seats}
        selected={selected}
        onToggleSeat={onToggleSeat}
      />
    );
  }

  return (
    <SeatMap3DFallback
      seats={seats}
      selected={selected}
      onToggleSeat={onToggleSeat}
    >
      <SeatMap3D
        seats={seats}
        selected={selected}
        onToggleSeat={onToggleSeat}
      />
    </SeatMap3DFallback>
  );
}
