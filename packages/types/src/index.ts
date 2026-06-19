export interface Event {
  _id: string;
  name: string;
  date: string;
  venue: string;
  city: string;
  category: string;
  totalSeats: number;
  availableSeats: number;
  description?: string;
  imageUrl?: string;
  featured?: boolean;
}

export interface EventDetail extends Event {
  seatSummary: {
    available: number;
    reserved: number;
    booked: number;
  };
}

export interface Seat {
  _id: string;
  eventId: string;
  seatNumber: string;
  status: "available" | "reserved" | "booked";
}

export interface Reservation {
  _id: string;
  userId: string;
  eventId: string;
  seatNumbers: string[];
  expiresAt: string;
}

export interface ReservationDetail extends Reservation {
  event: Pick<Event, "name" | "date" | "venue">;
}

export interface Booking {
  _id: string;
  eventId: string;
  seatNumbers: string[];
  bookedAt: string;
}

export interface BookingDetail extends Booking {
  event: Pick<Event, "name" | "date" | "venue">;
}

export interface UserBooking extends Booking {
  event: Pick<
    Event,
    "name" | "date" | "venue" | "city" | "category" | "imageUrl"
  >;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}

export interface ReserveResponse {
  reservationId: string;
  expiresAt: string;
  seatNumbers: string[];
}

export interface BookingResponse {
  bookingId: string;
  eventId: string;
  seatNumbers: string[];
  bookedAt: string;
}

export interface ReserveConflictError {
  message: string;
  failedSeats: string[];
}

export interface ExpiredError {
  message: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface AdminStats {
  eventCount: number;
  bookingCount: number;
  userCount: number;
}

export interface AdminBooking {
  _id: string;
  userId: string;
  eventId: string;
  seatNumbers: string[];
  bookedAt: string;
  user: {
    email: string;
    name: string;
  };
}

export interface CreateEventInput {
  name: string;
  date: string;
  venue: string;
  city: string;
  category: string;
  totalSeats: number;
  description?: string;
  imageUrl?: string;
  featured?: boolean;
}

export type UpdateEventInput = Partial<CreateEventInput>;
