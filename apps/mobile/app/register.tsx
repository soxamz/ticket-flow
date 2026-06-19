import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await register(trimmedName, trimmedEmail, password);
      router.replace("/(tabs)/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.outer}>
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🎫 TicketFlow</Text>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start booking events today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#555"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor="#555"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              placeholderTextColor="#555"
              secureTextEntry
              textContentType="newPassword"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              onSubmitEditing={handleRegister}
              returnKeyType="go"
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <Pressable>
              <Text style={styles.link}>Sign in</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ccc",
  },
  input: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: "#2d0b0b",
    borderWidth: 1,
    borderColor: "#7f1d1d",
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    color: "#888",
    fontSize: 15,
  },
  link: {
    color: "#a78bfa",
    fontSize: 15,
    fontWeight: "600",
  },
});
