import { Router } from "express";
import mongoose from "mongoose";
import { getDatabaseName } from "../lib/db.js";
import { getRouteParam } from "../lib/params.js";
import { generateSeatNumbers } from "../lib/seats.js";
import { adminMiddleware } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Event } from "../models/Event.js";
import { Reservation } from "../models/Reservation.js";
import { Seat } from "../models/Seat.js";
import {
  adminAssignBookingSchema,
  createEventSchema,
  updateEventSchema,
  updateUserRoleSchema,
} from "../validators/admin.js";

export const adminRouter: Router = Router();

adminRouter.use(adminMiddleware);

function getUserCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  const db = mongoose.connection.getClient().db(getDatabaseName(uri));
  return db.collection("user");
}

type AuthUserDocument = {
  id?: unknown;
  _id?: unknown;
  email?: unknown;
  name?: unknown;
  role?: unknown;
  createdAt?: unknown;
};

function getAuthUserId(user: AuthUserDocument): string | null {
  if (typeof user.id === "string" && user.id.length > 0) {
    return user.id;
  }

  if (user._id != null) {
    return String(user._id);
  }

  return null;
}

function authUserIdFilter(userId: string) {
  const filters: Record<string, unknown>[] = [{ id: userId }];

  if (mongoose.Types.ObjectId.isValid(userId)) {
    filters.push({ _id: new mongoose.Types.ObjectId(userId) });
  }

  return { $or: filters };
}

function serializeAuthUser(user: AuthUserDocument) {
  const id = getAuthUserId(user);
  if (!id) {
    return null;
  }

  return {
    id,
    email: String(user.email ?? ""),
    name: String(user.name ?? ""),
    role: typeof user.role === "string" ? user.role : "user",
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : new Date().toISOString(),
  };
}

async function getUserMap(userIds: string[]) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return new Map<string, { email: string; name: string }>();
  }

  const objectIds = uniqueIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const users = await getUserCollection()
    .find({
      $or: [
        { id: { $in: uniqueIds } },
        ...(objectIds.length > 0 ? [{ _id: { $in: objectIds } }] : []),
      ],
    })
    .project({ id: 1, _id: 1, email: 1, name: 1 })
    .toArray();

  const userMap = new Map<string, { email: string; name: string }>();

  for (const user of users) {
    const docId = getAuthUserId(user);
    if (!docId) {
      continue;
    }

    const info = {
      email: String(user.email ?? ""),
      name: String(user.name ?? ""),
    };

    userMap.set(docId, info);

    if (typeof user.id === "string" && user.id.length > 0) {
      userMap.set(user.id, info);
    }
  }

  return userMap;
}

function serializeEvent(event: {
  _id: mongoose.Types.ObjectId;
  name: string;
  date: Date;
  venue: string;
  city: string;
  category: string;
  totalSeats: number;
  description?: string | null;
  imageUrl?: string | null;
  featured?: boolean | null;
}) {
  return {
    _id: event._id.toString(),
    name: event.name,
    date: event.date.toISOString(),
    venue: event.venue,
    city: event.city,
    category: event.category,
    totalSeats: event.totalSeats,
    description: event.description ?? undefined,
    imageUrl: event.imageUrl ?? undefined,
    featured: event.featured ?? false,
  };
}

adminRouter.get("/stats", async (_req, res) => {
  const [eventCount, bookingCount, userCount] = await Promise.all([
    Event.countDocuments(),
    Booking.countDocuments(),
    getUserCollection().countDocuments(),
  ]);

  res.json({ eventCount, bookingCount, userCount });
});

adminRouter.get("/users", async (_req, res) => {
  const users = await getUserCollection()
    .find({})
    .project({ id: 1, _id: 1, email: 1, name: 1, role: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .toArray();

  res.json(
    users
      .map((user) => serializeAuthUser(user))
      .filter((user): user is NonNullable<typeof user> => user !== null),
  );
});

adminRouter.patch("/users/:id", async (req, res) => {
  const userId = getRouteParam(req.params.id);
  const parsed = updateUserRoleSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
    return;
  }

  if (!userId) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }

  if (userId === req.user?.userId && parsed.data.role !== "admin") {
    res
      .status(400)
      .json({ message: "You cannot remove your own admin access" });
    return;
  }

  const result = await getUserCollection().updateOne(authUserIdFilter(userId), {
    $set: { role: parsed.data.role },
  });

  if (result.matchedCount === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ id: userId, role: parsed.data.role });
});

adminRouter.get("/events", async (_req, res) => {
  const events = await Event.find().sort({ date: 1 });

  const eventsWithAvailability = await Promise.all(
    events.map(async (event) => {
      const availableSeats = await Seat.countDocuments({
        eventId: event._id,
        status: "available",
      });

      return {
        ...serializeEvent(event),
        availableSeats,
      };
    }),
  );

  res.json(eventsWithAvailability);
});

adminRouter.post("/events", async (req, res) => {
  const parsed = createEventSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
    return;
  }

  const data = parsed.data;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const createdEvents = await Event.create(
      [
        {
          name: data.name,
          date: new Date(data.date),
          venue: data.venue,
          city: data.city,
          category: data.category,
          totalSeats: data.totalSeats,
          description: data.description,
          imageUrl: data.imageUrl || undefined,
          featured: data.featured ?? false,
        },
      ],
      { session },
    );
    const event = createdEvents[0];

    if (!event) {
      throw new Error("Failed to create event");
    }

    const seatNumbers = generateSeatNumbers(data.totalSeats);
    await Seat.insertMany(
      seatNumbers.map((seatNumber) => ({
        eventId: event._id,
        seatNumber,
        status: "available",
      })),
      { session },
    );

    await session.commitTransaction();
    res.status(201).json({
      ...serializeEvent(event),
      availableSeats: data.totalSeats,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

adminRouter.patch("/events/:id", async (req, res) => {
  const id = getRouteParam(req.params.id);
  const parsed = updateEventSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
    return;
  }

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.date) {
    update.date = new Date(parsed.data.date);
  }
  if (parsed.data.imageUrl === "") {
    update.imageUrl = undefined;
  }

  const event = await Event.findByIdAndUpdate(id, update, { new: true });
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const availableSeats = await Seat.countDocuments({
    eventId: event._id,
    status: "available",
  });

  res.json({
    ...serializeEvent(event),
    availableSeats,
  });
});

adminRouter.delete("/events/:id", async (req, res) => {
  const id = getRouteParam(req.params.id);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(id).session(session);
    if (!event) {
      await session.abortTransaction();
      res.status(404).json({ message: "Event not found" });
      return;
    }

    await Promise.all([
      Seat.deleteMany({ eventId: event._id }, { session }),
      Booking.deleteMany({ eventId: event._id }, { session }),
      Reservation.deleteMany({ eventId: event._id }, { session }),
      Event.deleteOne({ _id: event._id }, { session }),
    ]);

    await session.commitTransaction();
    res.status(204).send();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

adminRouter.get("/events/:id/bookings", async (req, res) => {
  const id = getRouteParam(req.params.id);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  const event = await Event.findById(id);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const bookings = await Booking.find({ eventId: id }).sort({ bookedAt: -1 });
  const userMap = await getUserMap(bookings.map((booking) => booking.userId));

  res.json(
    bookings.map((booking) => ({
      _id: booking._id.toString(),
      userId: booking.userId,
      eventId: booking.eventId.toString(),
      seatNumbers: booking.seatNumbers,
      bookedAt: booking.bookedAt.toISOString(),
      user: userMap.get(booking.userId) ?? {
        email: "Unknown",
        name: "Unknown",
      },
    })),
  );
});

adminRouter.get("/events/:id/seats", async (req, res) => {
  const id = getRouteParam(req.params.id);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  const seats = await Seat.find({ eventId: id }).sort({ seatNumber: 1 });
  res.json(
    seats.map((seat) => ({
      _id: seat._id.toString(),
      eventId: seat.eventId.toString(),
      seatNumber: seat.seatNumber,
      status: seat.status,
    })),
  );
});

adminRouter.post("/events/:id/bookings", async (req, res) => {
  const eventId = getRouteParam(req.params.id);
  const parsed = adminAssignBookingSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
    return;
  }

  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const { userId, seatNumbers } = parsed.data;

  const user = await getUserCollection().findOne(authUserIdFilter(userId));
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const resolvedUserId = getAuthUserId(user) ?? userId;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const failedSeats: string[] = [];

    for (const seatNumber of seatNumbers) {
      const updated = await Seat.findOneAndUpdate(
        { eventId, seatNumber, status: "available" },
        { status: "booked" },
        { session, new: true },
      );

      if (!updated) {
        failedSeats.push(seatNumber);
      }
    }

    if (failedSeats.length > 0) {
      await session.abortTransaction();
      res.status(409).json({
        message: "One or more seats are not available",
        failedSeats,
      });
      return;
    }

    const bookedAt = new Date();
    const createdBookings = await Booking.create(
      [{ userId: resolvedUserId, eventId, seatNumbers, bookedAt }],
      { session },
    );
    const booking = createdBookings[0];

    if (!booking) {
      throw new Error("Failed to create booking");
    }

    await session.commitTransaction();

    res.status(201).json({
      _id: booking._id.toString(),
      userId: resolvedUserId,
      eventId,
      seatNumbers,
      bookedAt: bookedAt.toISOString(),
      user: {
        email: String(user.email ?? ""),
        name: String(user.name ?? ""),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

adminRouter.delete("/bookings/:id", async (req, res) => {
  const id = getRouteParam(req.params.id);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid booking id" });
    return;
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Seat.updateMany(
      {
        eventId: booking.eventId,
        seatNumber: { $in: booking.seatNumbers },
        status: "booked",
      },
      { status: "available" },
      { session },
    );

    await Booking.deleteOne({ _id: booking._id }, { session });
    await session.commitTransaction();
    res.status(204).send();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
