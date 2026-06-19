import type {
  AdminBooking,
  AdminStats,
  AdminUser,
  BookingDetail,
  BookingResponse,
  CreateEventInput,
  Event,
  EventDetail,
  ExpiredError,
  ReservationDetail,
  ReserveConflictError,
  ReserveResponse,
  Seat,
  UpdateEventInput,
  UserBooking,
} from "@repo/types";
import { BEARER_TOKEN_KEY } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(BEARER_TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Request failed";
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export const api = {
  getEvents() {
    return request<Event[]>("/api/events");
  },

  getEvent(id: string) {
    return request<EventDetail>(`/api/events/${id}`);
  },

  getEventSeats(id: string) {
    return request<Seat[]>(`/api/events/${id}/seats`);
  },

  reserve(eventId: string, seatNumbers: string[]) {
    return request<ReserveResponse>(
      "/api/reserve",
      {
        method: "POST",
        body: JSON.stringify({ eventId, seatNumbers }),
      },
      true,
    );
  },

  getReservation(id: string) {
    return request<ReservationDetail>(`/api/reservations/${id}`, {}, true);
  },

  cancelReservation(id: string) {
    return request<void>(`/api/reservations/${id}`, { method: "DELETE" }, true);
  },

  confirmBooking(reservationId: string) {
    return request<BookingResponse>(
      "/api/bookings",
      {
        method: "POST",
        body: JSON.stringify({ reservationId }),
      },
      true,
    );
  },

  getBooking(id: string) {
    return request<BookingDetail>(`/api/bookings/${id}`, {}, true);
  },

  getMyBookings() {
    return request<UserBooking[]>("/api/bookings", {}, true);
  },

  getAdminStats() {
    return request<AdminStats>("/api/admin/stats", {}, true);
  },

  getAdminUsers() {
    return request<AdminUser[]>("/api/admin/users", {}, true);
  },

  updateAdminUserRole(id: string, role: "user" | "admin") {
    return request<{ id: string; role: "user" | "admin" }>(
      `/api/admin/users/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ role }),
      },
      true,
    );
  },

  getAdminEvents() {
    return request<Event[]>("/api/admin/events", {}, true);
  },

  createAdminEvent(data: CreateEventInput) {
    return request<Event>(
      "/api/admin/events",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    );
  },

  updateAdminEvent(id: string, data: UpdateEventInput) {
    return request<Event>(
      `/api/admin/events/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      true,
    );
  },

  deleteAdminEvent(id: string) {
    return request<void>(`/api/admin/events/${id}`, { method: "DELETE" }, true);
  },

  getAdminEventBookings(eventId: string) {
    return request<AdminBooking[]>(
      `/api/admin/events/${eventId}/bookings`,
      {},
      true,
    );
  },

  getAdminEventSeats(eventId: string) {
    return request<Seat[]>(`/api/admin/events/${eventId}/seats`, {}, true);
  },

  assignAdminBooking(
    eventId: string,
    data: { userId: string; seatNumbers: string[] },
  ) {
    return request<AdminBooking>(
      `/api/admin/events/${eventId}/bookings`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    );
  },

  removeAdminBooking(bookingId: string) {
    return request<void>(
      `/api/admin/bookings/${bookingId}`,
      { method: "DELETE" },
      true,
    );
  },
};

export function isReserveConflict(error: unknown): error is ApiError & {
  data: ReserveConflictError;
} {
  return (
    error instanceof ApiError &&
    error.status === 409 &&
    typeof error.data === "object" &&
    error.data !== null &&
    "failedSeats" in error.data
  );
}

export function isExpiredError(error: unknown): error is ApiError & {
  data: ExpiredError;
} {
  return error instanceof ApiError && error.status === 410;
}

export const SEAT_PRICE = 400;
