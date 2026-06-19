import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#a78bfa",
        tabBarInactiveTintColor: "#555",
        tabBarStyle: {
          backgroundColor: "#0d0d0d",
          borderTopColor: "#1e1e1e",
          borderTopWidth: 1,
          paddingTop: Platform.OS === "android" ? 4 : 0,
          height: Platform.OS === "android" ? 64 : 80,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: Platform.OS === "android" ? 4 : 0,
        },
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
