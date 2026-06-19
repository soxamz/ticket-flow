import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const reserveSchema = z.object({
  eventId: z.string().min(1),
  seatNumbers: z.array(z.string().min(1)).min(1),
});

export const bookingSchema = z.object({
  reservationId: z.string().min(1),
});
