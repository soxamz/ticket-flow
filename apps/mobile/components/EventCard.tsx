import type { Event } from "@repo/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Calendar, MapPin, Ticket } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/events/${event._id}`)} activeOpacity={0.85}>
      <Image
        source={{ uri: event.imageUrl ?? `https://picsum.photos/seed/${event._id}/400/200` }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      {event.featured ? (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      ) : null}

      <View style={styles.body}>
        <Text style={styles.category}>{event.category.toUpperCase()}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {event.name}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Calendar size={13} color="#888" />
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={13} color="#888" />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.venue}, {event.city}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <Ticket size={13} color={event.availableSeats > 0 ? "#22c55e" : "#ef4444"} />
            <Text style={[styles.seatsText, { color: event.availableSeats > 0 ? "#22c55e" : "#ef4444" }]}>
              {event.availableSeats > 0 ? `${event.availableSeats} seats left` : "Sold out"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#1a1a1a",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  featuredText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  body: {
    padding: 16,
  },
  category: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7c3aed",
    letterSpacing: 1,
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    lineHeight: 24,
  },
  meta: {
    gap: 6,
    marginBottom: 12,
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
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#1e1e1e",
    paddingTop: 12,
  },
  seatsText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
