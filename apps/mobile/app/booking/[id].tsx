import { Ionicons } from "@expo/vector-icons";
import type { BookingDetail } from "@repo/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api, SEAT_PRICE } from "../../lib/api";

export default function BookingConfirmedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getBooking(id);
      setBooking(data);
    } catch {
      setError("Could not load booking details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  async function handleShare() {
    if (!booking) return;
    try {
      await Share.share({
        message: `🎫 I just booked tickets to ${booking.event.name} at ${booking.event.venue}! Seats: ${booking.seatNumbers.join(", ")}`,
        title: `TicketFlow – ${booking.event.name}`,
      });
    } catch {
      // share dismissed
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Booking not found."}</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/account")} style={styles.button}>
          <Text style={styles.buttonText}>Go to Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalCost = booking.seatNumbers.length * SEAT_PRICE;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Success header */}
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>Your tickets are secured. Have a great time!</Text>
        </View>

        {/* Booking reference */}
        <View style={styles.refCard}>
          <Text style={styles.refLabel}>BOOKING REFERENCE</Text>
          <Text style={styles.refValue} numberOfLines={1} adjustsFontSizeToFit>
            {booking._id.slice(-12).toUpperCase()}
          </Text>
        </View>

        {/* Event details */}
        <View style={styles.card}>
          <Text style={styles.eventName}>{booking.event.name}</Text>

          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={15} color="#888" />
              <Text style={styles.metaText}>
                {new Date(booking.event.date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={15} color="#888" />
              <Text style={styles.metaText}>{booking.event.venue}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={15} color="#888" />
              <Text style={styles.metaText}>
                Booked on{" "}
                {new Date(booking.bookedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Seats */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Your Seats</Text>
          <View style={styles.seatsList}>
            {booking.seatNumbers.map((seat) => (
              <View key={seat} style={styles.seatChip}>
                <Text style={styles.seatChipText}>{seat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total */}
        <View style={styles.card}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{totalCost.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.85}>
          <Ionicons name="share-social-outline" size={18} color="#fff" />
          <Text style={styles.shareButtonText}>Share Tickets</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace("/(tabs)/events")}
          activeOpacity={0.85}
        >
          <Text style={styles.homeButtonText}>Browse More Events</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  centered: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  successHeader: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  successTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  successSubtitle: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
  },
  refCard: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  refLabel: {
    color: "#c4b5fd",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  refValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 3,
  },
  card: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  eventName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  metaList: { gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { color: "#888", fontSize: 14, flex: 1 },
  sectionLabel: {
    color: "#888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  seatsList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  seatChip: {
    backgroundColor: "#14532d",
    borderWidth: 1,
    borderColor: "#22c55e",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  seatChipText: { color: "#22c55e", fontSize: 13, fontWeight: "600" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { color: "#fff", fontSize: 16, fontWeight: "600" },
  totalValue: { color: "#22c55e", fontSize: 22, fontWeight: "700" },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7c3aed",
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  homeButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  homeButtonText: { color: "#888", fontSize: 15, fontWeight: "600" },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#7c3aed",
    borderRadius: 12,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  errorText: { color: "#ef4444", fontSize: 16, textAlign: "center" },
});
