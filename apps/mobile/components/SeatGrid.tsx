import type { Seat } from "@repo/types";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SeatGridProps {
  seats: Seat[];
  selected: Set<string>;
  onToggle: (seatNumber: string) => void;
  maxSelectable?: number;
}

const COLUMNS = 10;
const SEAT_GAP = 4;
const MAX_SEAT_SIZE = 40;
const MIN_SEAT_SIZE = 28;

export function SeatGrid({ seats, selected, onToggle, maxSelectable = 6 }: SeatGridProps) {
  const [gridWidth, setGridWidth] = useState(0);

  const sortedSeats = useMemo(
    () =>
      [...seats].sort((a, b) =>
        a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true, sensitivity: "base" }),
      ),
    [seats],
  );

  const seatSize = useMemo(() => {
    if (gridWidth <= 0) return MIN_SEAT_SIZE;
    const totalGap = SEAT_GAP * (COLUMNS - 1);
    return Math.max(MIN_SEAT_SIZE, Math.min(MAX_SEAT_SIZE, Math.floor((gridWidth - totalGap) / COLUMNS)));
  }, [gridWidth]);

  function getSeatStyle(seat: Seat) {
    if (seat.status === "booked") return styles.seatBooked;
    if (seat.status === "reserved") return styles.seatReserved;
    if (selected.has(seat.seatNumber)) return styles.seatSelected;
    return styles.seatAvailable;
  }

  function getSeatTextStyle(seat: Seat) {
    if (seat.status === "booked" || seat.status === "reserved") return styles.seatTextDisabled;
    if (selected.has(seat.seatNumber)) return styles.seatTextSelected;
    return styles.seatTextAvailable;
  }

  function handlePress(seat: Seat) {
    if (seat.status !== "available") return;
    const isSelected = selected.has(seat.seatNumber);
    if (!isSelected && selected.size >= maxSelectable) return;
    onToggle(seat.seatNumber);
  }

  return (
    <View>
      {/* Legend */}
      <View style={styles.legend}>
        {LEGEND_ITEMS.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Stage */}
      <View style={styles.stage}>
        <Text style={styles.stageText}>STAGE</Text>
      </View>

      {/* Grid */}
      <View style={styles.gridWrapper} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
        <FlatList
          data={sortedSeats}
          keyExtractor={(item) => item._id}
          numColumns={COLUMNS}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.seat,
                { width: seatSize, height: seatSize, marginRight: (index + 1) % COLUMNS === 0 ? 0 : SEAT_GAP },
                getSeatStyle(item),
              ]}
              onPress={() => handlePress(item)}
              disabled={item.status !== "available"}
              activeOpacity={0.7}
            >
              <Text style={[styles.seatText, getSeatTextStyle(item)]} numberOfLines={1} adjustsFontSizeToFit>
                {item.seatNumber}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.grid}
        />
      </View>
    </View>
  );
}

const LEGEND_ITEMS = [
  { label: "Available", color: "#22c55e" },
  { label: "Selected", color: "#7c3aed" },
  { label: "Reserved", color: "#f97316" },
  { label: "Booked", color: "#3f3f46" },
];

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: "#888",
    fontSize: 12,
  },
  stage: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  stageText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
  },
  gridWrapper: {
    width: "100%",
    alignItems: "center",
  },
  grid: {
    gap: SEAT_GAP,
  },
  seat: {
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  seatAvailable: {
    backgroundColor: "#14532d",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  seatSelected: {
    backgroundColor: "#7c3aed",
    borderWidth: 1,
    borderColor: "#a855f7",
  },
  seatReserved: {
    backgroundColor: "#431407",
    borderWidth: 1,
    borderColor: "#f97316",
  },
  seatBooked: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  seatText: {
    fontSize: 9,
    fontWeight: "600",
  },
  seatTextAvailable: {
    color: "#22c55e",
  },
  seatTextSelected: {
    color: "#fff",
  },
  seatTextDisabled: {
    color: "#555",
  },
});
