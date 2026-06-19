import type {
  BookingDetail,
  BookingResponse,
  Event,
  EventDetail,
  ReservationDetail,
  ReserveResponse,
  Seat,
  UserBooking,
} from "@repo/types";
import { getToken } from "./storage";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export const SEAT_PRICE = 499;

export class ApiError extends Error {
  status: number;
  // biome-ignore lint/suspicious/noExplicitAny: safe union
  data: any;

  // biome-ignore lint/suspicious/noExplicitAny: safe union
  constructor(status: number, message: string, data: any = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}, withAuth = false): Promise<T> {
  const headers = new Headers(options.headers as HeadersInit | undefined);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (withAuth) {
    const token = await getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String(data.message)
        : `Request failed (${response.status})`;
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export const api = {
  // ─── Auth ────────────────────────────────────────────────────────────────
  signIn: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(response.status, data?.message ?? "Sign in failed", data);
    }
    const token = response.headers.get("set-auth-token");
    return { user: data?.user as AuthSessionUser | null, token };
  },

  signUp: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(response.status, data?.message ?? "Sign up failed", data);
    }
    const token = response.headers.get("set-auth-token");
    return { user: data?.user as AuthSessionUser | null, token };
  },

  getSession: async (token: string): Promise<AuthSessionUser | null> => {
    const response = await fetch(`${API_URL}/api/auth/get-session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    return (data?.user ?? null) as AuthSessionUser | null;
  },

  signOut: async () => {
    const token = await getToken();
    if (!token) return;
    await fetch(`${API_URL}/api/auth/sign-out`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  },

  // ─── Events ──────────────────────────────────────────────────────────────
  getEvents: () => request<Event[]>("/api/events"),
  getEvent: (id: string) => request<EventDetail>(`/api/events/${id}`),
  getEventSeats: (id: string) => request<Seat[]>(`/api/events/${id}/seats`),

  // ─── Reservation ─────────────────────────────────────────────────────────
  reserve: (eventId: string, seatNumbers: string[]) =>
    request<ReserveResponse>("/api/reserve", { method: "POST", body: JSON.stringify({ eventId, seatNumbers }) }, true),

  getReservation: (id: string) => request<ReservationDetail>(`/api/reservations/${id}`, {}, true),

  cancelReservation: (id: string) => request<void>(`/api/reservations/${id}`, { method: "DELETE" }, true),

  // ─── Booking ─────────────────────────────────────────────────────────────
  confirmBooking: (reservationId: string) =>
    request<BookingResponse>("/api/bookings", { method: "POST", body: JSON.stringify({ reservationId }) }, true),

  getBooking: (id: string) => request<BookingDetail>(`/api/bookings/${id}`, {}, true),

  getMyBookings: () => request<UserBooking[]>("/api/bookings/me", {}, true),
};

// ─── Internal type for raw Better Auth session user ──────────────────────────
export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}
