import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  venue: z.string().min(1),
  city: z.string().min(1),
  category: z.string().min(1),
  totalSeats: z.number().int().min(1).max(500),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export const adminAssignBookingSchema = z.object({
  userId: z.string().min(1),
  seatNumbers: z.array(z.string().min(1)).min(1),
});
