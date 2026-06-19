import type { Seat } from "@repo/types";

export interface ParsedSeatNumber {
  row: string;
  rowIndex: number;
  seatIndex: number;
}

export interface SeatLayoutPosition {
  x: number;
  z: number;
}

export const SEAT_SPACING = 0.85;
export const ROW_SPACING = 1.1;
export const SCHEMATIC_SCALE = 52;

export function parseSeatNumber(seatNumber: string): ParsedSeatNumber | null {
  const match = seatNumber.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    return null;
  }

  const row = match[1];
  const seatIndex = Number.parseInt(match[2], 10);
  if (!row || Number.isNaN(seatIndex)) {
    return null;
  }

  const rowIndex = row.charCodeAt(0) - 65;

  return { row, rowIndex, seatIndex };
}

export function compareSeatNumbers(a: string, b: string): number {
  const parsedA = parseSeatNumber(a);
  const parsedB = parseSeatNumber(b);

  if (!parsedA && !parsedB) {
    return a.localeCompare(b);
  }
  if (!parsedA) {
    return 1;
  }
  if (!parsedB) {
    return -1;
  }

  if (parsedA.rowIndex !== parsedB.rowIndex) {
    return parsedA.rowIndex - parsedB.rowIndex;
  }

  return parsedA.seatIndex - parsedB.seatIndex;
}

export function sortSeats(seats: Seat[]): Seat[] {
  return [...seats].sort((a, b) =>
    compareSeatNumbers(a.seatNumber, b.seatNumber),
  );
}

export function groupSeatsByRow(seats: Seat[]): Map<string, Seat[]> {
  const sorted = sortSeats(seats);
  const rows = new Map<string, Seat[]>();

  for (const seat of sorted) {
    const parsed = parseSeatNumber(seat.seatNumber);
    const row = parsed?.row ?? "?";
    const existing = rows.get(row) ?? [];
    existing.push(seat);
    rows.set(row, existing);
  }

  return rows;
}

export function getSeatPosition(
  seatNumber: string,
  seatsInRow: number,
): SeatLayoutPosition | null {
  const parsed = parseSeatNumber(seatNumber);
  if (!parsed) {
    return null;
  }

  const x = (parsed.seatIndex - 1 - (seatsInRow - 1) / 2) * SEAT_SPACING;
  const z = parsed.rowIndex * ROW_SPACING;

  return { x, z };
}

export function buildSeatLayout(seats: Seat[]) {
  const sorted = sortSeats(seats);
  const rows = groupSeatsByRow(sorted);
  const maxSeatsPerRow = Math.max(
    1,
    ...Array.from(rows.values(), (rowSeats) => rowSeats.length),
  );

  const positioned = sorted
    .map((seat) => {
      const position = getSeatPosition(seat.seatNumber, maxSeatsPerRow);
      if (!position) {
        return null;
      }

      return { seat, position };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const depth = Math.max(1, ...positioned.map(({ position }) => position.z));

  return {
    seats: positioned,
    rows: Array.from(rows.entries()),
    maxSeatsPerRow,
    depth,
  };
}
