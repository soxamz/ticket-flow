import { Ionicons } from "@expo/vector-icons";
import type { EventDetail, Seat } from "@repo/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SeatGrid } from "../../components/SeatGrid";
import { useAuth } from "../../context/AuthContext";
import { api, SEAT_PRICE } from "../../lib/api";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const [eventData, seatData] = await Promise.all([api.getEvent(id), api.getEventSeats(id)]);
      setEvent(eventData);
      setSeats(seatData);
    } catch {
      setError("Failed to load event details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function toggleSeat(seatNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(seatNumber)) {
        next.delete(seatNumber);
      } else {
        next.add(seatNumber);
      }
      return next;
    });
  }

  async function handleReserve() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (selected.size === 0) {
      Alert.alert("Select Seats", "Please select at least one seat.");
      return;
    }

    setReserving(true);
    try {
      const { reservationId } = await api.reserve(id!, Array.from(selected));
      router.push(`/reservation/${reservationId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reservation failed.";
      Alert.alert("Reservation Failed", message);
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Event not found."}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalCost = selected.size * SEAT_PRICE;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri: event.imageUrl ?? `https://picsum.photos/seed/${event._id}/800/400`,
          }}
          style={styles.heroImage}
        />

        <View style={styles.body}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.category}>{event.category.toUpperCase()}</Text>
            <Text style={styles.name}>{event.name}</Text>

            <View style={styles.metaList}>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color="#888" />
                <Text style={styles.metaText}>{formattedDate}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color="#888" />
                <Text style={styles.metaText}>
                  {event.venue}, {event.city}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="ticket-outline" size={16} color={event.availableSeats > 0 ? "#22c55e" : "#ef4444"} />
                <Text style={[styles.metaText, { color: event.availableSeats > 0 ? "#22c55e" : "#ef4444" }]}>
                  {event.availableSeats} of {event.totalSeats} seats available
                </Text>
              </View>
            </View>

            {event.description ? <Text style={styles.description}>{event.description}</Text> : null}
          </View>

          {/* Seat selection */}
          <View style={styles.seatSection}>
            <Text style={styles.sectionTitle}>
              Select Seats
              {selected.size > 0 ? ` (${selected.size} selected)` : ""}
            </Text>

            {seats.length === 0 ? (
              <Text style={styles.noSeats}>No seat data available.</Text>
            ) : (
              <SeatGrid seats={seats} selected={selected} onToggle={toggleSeat} maxSelectable={6} />
            )}
          </View>
        </View>

        {/* Bottom padding for fixed bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky bottom action */}
      {event.availableSeats > 0 && (
        <View style={styles.actionBar}>
          <View style={styles.costInfo}>
            <Text style={styles.costLabel}>Total</Text>
            <Text style={styles.costValue}>
              {selected.size === 0 ? `₹${SEAT_PRICE}/seat` : `₹${totalCost.toLocaleString("en-IN")}`}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.reserveButton, (reserving || selected.size === 0) && styles.reserveButtonDisabled]}
            onPress={handleReserve}
            disabled={reserving || selected.size === 0}
            activeOpacity={0.85}
          >
            {reserving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.reserveButtonText}>
                {selected.size === 0 ? "Select Seats" : `Reserve ${selected.size} Seat${selected.size > 1 ? "s" : ""}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  centered: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  heroImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#1a1a1a",
  },
  body: {
    padding: 16,
    gap: 24,
  },
  header: {
    gap: 12,
  },
  category: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7c3aed",
    letterSpacing: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 30,
  },
  metaList: {
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    color: "#888",
    fontSize: 14,
    flex: 1,
  },
  description: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
  seatSection: {
    gap: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  noSeats: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 24,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  costInfo: {
    flex: 1,
  },
  costLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500",
  },
  costValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  reserveButton: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
  },
  reserveButtonDisabled: {
    opacity: 0.5,
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
