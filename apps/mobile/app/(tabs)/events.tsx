import { Ionicons } from "@expo/vector-icons";
import type { Event } from "@repo/types";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { EventCard } from "../../components/EventCard";
import { api } from "../../lib/api";

const CATEGORIES = ["All", "Music", "Sports", "Arts", "Comedy", "Tech"];

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getEvents();
      setEvents(data);
    } catch {
      setError("Failed to load events. Pull to refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function onRefresh() {
    setRefreshing(true);
    fetchEvents();
  }

  const filtered = events.filter((e) => {
    const matchesSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || e.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events or cities…"
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === item && styles.categoryChipActive]}
            onPress={() => setActiveCategory(item)}
          >
            <Text style={[styles.categoryText, activeCategory === item && styles.categoryTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.categoryBar}
      />

      {/* Events list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <>
                <Ionicons name="calendar-outline" size={48} color="#333" />
                <Text style={styles.emptyText}>
                  {search || activeCategory !== "All" ? "No events match your filters" : "No events available"}
                </Text>
              </>
            )}
          </View>
        }
      />
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
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
  },
  categoryBar: {
    maxHeight: 50,
    marginBottom: 4,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  categoryChipActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  categoryText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 64,
    gap: 16,
  },
  emptyText: {
    color: "#555",
    fontSize: 15,
    textAlign: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 15,
    textAlign: "center",
  },
});
