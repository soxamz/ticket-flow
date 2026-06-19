import type { Seat } from "@repo/types";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SeatGridProps {
  seats: Seat[];
  selected: Set<string>;
  onToggle: (seatNumber: string) => void;
  maxSelectable?: number;
}

const SEAT_SIZE = 36;
const COLUMNS = 10;

export function SeatGrid({ seats, selected, onToggle, maxSelectable = 6 }: SeatGridProps) {
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
      <FlatList
        data={seats}
        keyExtractor={(item) => item._id}
        numColumns={COLUMNS}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.seat, getSeatStyle(item)]}
            onPress={() => handlePress(item)}
            disabled={item.status !== "available"}
            activeOpacity={0.7}
          >
            <Text style={[styles.seatText, getSeatTextStyle(item)]}>{item.seatNumber}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.grid}
      />
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
  grid: {
    alignItems: "center",
  },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    margin: 2,
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
