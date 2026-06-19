import { Ionicons } from "@expo/vector-icons";
import type { ReservationDetail } from "@repo/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api, SEAT_PRICE } from "../../lib/api";

function useCountdown(expiresAt: string | null) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    function tick() {
      const ms = new Date(expiresAt!).getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.floor(ms / 1000)));
    }

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [expiresAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return {
    secondsLeft,
    display: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
  };
}

export default function ReservationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { secondsLeft, display: countdownDisplay } = useCountdown(reservation?.expiresAt ?? null);

  const fetchReservation = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getReservation(id);
      setReservation(data);
    } catch {
      setError("Reservation not found or has expired.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReservation();
  }, [fetchReservation]);

  async function handleConfirm() {
    if (!reservation) return;
    setConfirming(true);
    try {
      const { bookingId } = await api.confirmBooking(reservation._id);
      router.replace(`/booking/${bookingId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Booking failed.";
      Alert.alert("Booking Failed", message);
    } finally {
      setConfirming(false);
    }
  }

  async function handleCancel() {
    if (!reservation) return;
    Alert.alert("Cancel Reservation", "Release these seats and go back?", [
      { text: "Keep", style: "cancel" },
      {
        text: "Cancel Reservation",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            await api.cancelReservation(reservation._id);
            router.back();
          } catch {
            Alert.alert("Error", "Could not cancel reservation.");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error || !reservation) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error ?? "Reservation not found."}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isExpired = secondsLeft === 0;
  const totalCost = reservation.seatNumbers.length * SEAT_PRICE;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Countdown */}
        <View style={[styles.countdownCard, isExpired && styles.countdownCardExpired]}>
          <Ionicons
            name={isExpired ? "time-outline" : "timer-outline"}
            size={24}
            color={isExpired ? "#ef4444" : "#f97316"}
          />
          <View>
            <Text style={[styles.countdownTimer, isExpired && styles.countdownExpiredText]}>
              {isExpired ? "EXPIRED" : countdownDisplay}
            </Text>
            <Text style={styles.countdownLabel}>
              {isExpired ? "Your reservation has expired" : "Reservation hold expires in"}
            </Text>
          </View>
        </View>

        {/* Event info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{reservation.event.name}</Text>
          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text style={styles.metaText}>
                {new Date(reservation.event.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{reservation.event.venue}</Text>
            </View>
          </View>
        </View>

        {/* Seats */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Selected Seats</Text>
          <View style={styles.seatsList}>
            {reservation.seatNumbers.map((seat) => (
              <View key={seat} style={styles.seatChip}>
                <Text style={styles.seatChipText}>{seat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cost breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Order Summary</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>
              {reservation.seatNumbers.length} × ₹{SEAT_PRICE}
            </Text>
            <Text style={styles.costValue}>₹{totalCost.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.costRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{totalCost.toLocaleString("en-IN")}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={cancelling || confirming}
          activeOpacity={0.8}
        >
          {cancelling ? (
            <ActivityIndicator color="#888" size="small" />
          ) : (
            <Text style={styles.cancelButtonText}>Cancel</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmButton, (confirming || isExpired) && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={confirming || isExpired}
          activeOpacity={0.85}
        >
          {confirming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>{isExpired ? "Expired" : "Confirm & Pay"}</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: { padding: 16, paddingBottom: 100, gap: 16 },
  countdownCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#1a1000",
    borderWidth: 1,
    borderColor: "#f97316",
    borderRadius: 14,
    padding: 16,
  },
  countdownCardExpired: {
    backgroundColor: "#1a0000",
    borderColor: "#ef4444",
  },
  countdownTimer: {
    color: "#f97316",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
  countdownExpiredText: { color: "#ef4444" },
  countdownLabel: { color: "#888", fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  metaList: { gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { color: "#888", fontSize: 14, flex: 1 },
  sectionLabel: { color: "#888", fontSize: 12, fontWeight: "600", letterSpacing: 1 },
  seatsList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  seatChip: {
    backgroundColor: "#7c3aed22",
    borderWidth: 1,
    borderColor: "#7c3aed",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  seatChipText: { color: "#a78bfa", fontSize: 13, fontWeight: "600" },
  costRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  costLabel: { color: "#888", fontSize: 14 },
  costValue: { color: "#ccc", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#222" },
  totalLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },
  totalValue: { color: "#fff", fontSize: 20, fontWeight: "700" },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#222",
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  cancelButtonText: { color: "#888", fontSize: 15, fontWeight: "600" },
  confirmButton: {
    flex: 2,
    backgroundColor: "#7c3aed",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  errorText: { color: "#ef4444", fontSize: 16, textAlign: "center" },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  backButtonText: { color: "#fff", fontWeight: "600" },
});
