import { Ionicons } from "@expo/vector-icons";
import type { UserBooking } from "@repo/types";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getMyBookings();
      setBookings(data);
    } catch {
      setError("Could not load your bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchBookings();
          }}
          tintColor="#7c3aed"
        />
      }
    >
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase() ?? "?"}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          {user?.role === "admin" ? (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Bookings */}
      <Text style={styles.sectionTitle}>My Bookings</Text>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyBookings}>
          <Ionicons name="ticket-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>No bookings yet</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/events")}>
            <Text style={styles.browseLink}>Browse Events →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        bookings.map((booking) => (
          <TouchableOpacity
            key={booking._id}
            style={styles.bookingCard}
            onPress={() => router.push(`/booking/${booking._id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingEventName} numberOfLines={1}>
                {booking.event.name}
              </Text>
              <View style={styles.confirmedBadge}>
                <Text style={styles.confirmedText}>Confirmed</Text>
              </View>
            </View>

            <View style={styles.bookingMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={13} color="#888" />
                <Text style={styles.metaText}>
                  {new Date(booking.event.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={13} color="#888" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {booking.event.venue}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="ticket-outline" size={13} color="#888" />
                <Text style={styles.metaText}>{booking.seatNumbers.join(", ")}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  profileEmail: {
    color: "#888",
    fontSize: 14,
  },
  adminBadge: {
    backgroundColor: "#7c3aed22",
    borderWidth: 1,
    borderColor: "#7c3aed",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  adminBadgeText: {
    color: "#a78bfa",
    fontSize: 11,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  emptyBookings: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    color: "#555",
    fontSize: 16,
  },
  browseLink: {
    color: "#a78bfa",
    fontSize: 15,
    fontWeight: "600",
  },
  bookingCard: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 12,
    gap: 12,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  bookingEventName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  confirmedBadge: {
    backgroundColor: "#14532d",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  confirmedText: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "600",
  },
  bookingMeta: {
    gap: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#888",
    fontSize: 13,
    flex: 1,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3f1515",
    backgroundColor: "#1a0a0a",
  },
  signOutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 16,
  },
});
