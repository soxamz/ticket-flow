"use client";

import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import type { Seat } from "@repo/types";
import { useMemo } from "react";
import { Color, type ColorRepresentation } from "three";
import { buildSeatLayout } from "@/lib/seat-layout";

interface SeatMap3DProps {
  seats: Seat[];
  selected: string[];
  onToggleSeat: (seatNumber: string, status: Seat["status"]) => void;
}

const MIN_VIEWPORT_WIDTH = 640;

function getSeatColor(
  status: Seat["status"],
  isSelected: boolean,
): ColorRepresentation {
  if (isSelected) {
    return "#a855f7";
  }

  switch (status) {
    case "booked":
      return "#ef4444";
    case "reserved":
      return "#52525b";
    default:
      return "#3f3f46";
  }
}

interface AuditoriumSeatProps {
  seat: Seat;
  position: { x: number; z: number };
  isSelected: boolean;
  onToggle: (seatNumber: string, status: Seat["status"]) => void;
}

function AuditoriumSeat({
  seat,
  position,
  isSelected,
  onToggle,
}: AuditoriumSeatProps) {
  const isAvailable = seat.status === "available";
  const color = getSeatColor(seat.status, isSelected);

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    if (!isAvailable) {
      return;
    }
    onToggle(seat.seatNumber, seat.status);
  }

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    if (isAvailable) {
      document.body.style.cursor = "pointer";
    }
  }

  function handlePointerOut() {
    document.body.style.cursor = "auto";
  }

  return (
    <group position={[position.x, 0, position.z]}>
      <RoundedBox
        args={[0.72, 0.45, 0.72]}
        radius={0.08}
        smoothness={4}
        position={[0, 0.22, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? "#9333ea" : "#000000"}
          emissiveIntensity={isSelected ? 0.35 : 0}
          metalness={0.15}
          roughness={0.65}
        />
      </RoundedBox>
      <Html
        center
        position={[0, 0.52, 0]}
        transform
        sprite
        distanceFactor={10}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <span
          className="font-mono text-[10px] leading-none"
          style={{ color: isSelected ? "#fafafa" : "#d4d4d8" }}
        >
          {seat.seatNumber}
        </span>
      </Html>
    </group>
  );
}

function Screen() {
  return (
    <group position={[0, 0, -1.8]}>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[9, 2.2, 0.12]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#9333ea"
          emissiveIntensity={0.55}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.15, 0.4]}>
        <boxGeometry args={[9.5, 0.2, 0.8]} />
        <meshStandardMaterial color="#27272a" roughness={0.9} />
      </mesh>
      <Html
        center
        position={[0, 2.85, 0]}
        transform
        sprite
        distanceFactor={12}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <span className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
          Screen
        </span>
      </Html>
    </group>
  );
}

function Entrance({
  position,
  label,
}: {
  position: [number, number, number];
  label: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 1, 0.15]} />
        <meshStandardMaterial
          color="#52525b"
          emissive="#71717a"
          emissiveIntensity={0.15}
        />
      </mesh>
      <Html
        center
        position={[0, 1.35, 0]}
        transform
        sprite
        distanceFactor={12}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <span className="text-[10px] text-zinc-400">{label}</span>
      </Html>
    </group>
  );
}

function AuditoriumScene({ seats, selected, onToggleSeat }: SeatMap3DProps) {
  const layout = useMemo(() => buildSeatLayout(seats), [seats]);
  const backZ = layout.depth + 1.5;

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 10, 6]} intensity={0.85} />
      <directionalLight
        position={[-6, 6, -2]}
        intensity={0.25}
        color="#c4b5fd"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, layout.depth / 2]}>
        <planeGeometry args={[14, layout.depth + 5]} />
        <meshStandardMaterial color="#18181b" roughness={0.95} />
      </mesh>

      <Screen />

      {layout.seats.map(({ seat, position }) => (
        <AuditoriumSeat
          key={seat._id ?? seat.seatNumber}
          seat={seat}
          position={position}
          isSelected={selected.includes(seat.seatNumber)}
          onToggle={onToggleSeat}
        />
      ))}

      <Entrance position={[-5.5, 0, backZ]} label="Entrance A" />
      <Entrance position={[5.5, 0, backZ]} label="Entrance B" />

      <OrbitControls
        target={[0, 0.5, layout.depth / 2]}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={6}
        maxDistance={18}
        enablePan={false}
      />
    </>
  );
}

export function SeatMap3D(props: SeatMap3DProps) {
  return (
    <div className="relative h-[min(62vh,520px)] w-full overflow-x-auto overflow-y-hidden rounded-xl border border-border/60 bg-zinc-950">
      <div className="relative h-full" style={{ minWidth: MIN_VIEWPORT_WIDTH }}>
        <Canvas
          className="absolute inset-0 h-full w-full"
          style={{ background: "#09090b" }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ scene }) => {
            scene.background = new Color("#09090b");
          }}
          camera={{ position: [0, 7, 11], fov: 42 }}
        >
          <AuditoriumScene {...props} />
        </Canvas>
        <p className="text-muted-foreground pointer-events-none absolute right-3 bottom-3 z-10 text-xs">
          Drag to orbit · Click seats to select
        </p>
      </div>
    </div>
  );
}
