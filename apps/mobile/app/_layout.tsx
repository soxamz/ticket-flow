import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: "#0a0a0a" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "700" },
              contentStyle: { backgroundColor: "#0a0a0a" },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="events/[id]" options={{ title: "Event Details", presentation: "card" }} />
            <Stack.Screen name="reservation/[id]" options={{ title: "Confirm Reservation", presentation: "card" }} />
            <Stack.Screen name="booking/[id]" options={{ title: "Booking Confirmed", presentation: "card" }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
