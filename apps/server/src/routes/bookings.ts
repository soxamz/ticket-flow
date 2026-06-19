import { Router } from "express";
import mongoose from "mongoose";
import { getRouteParam } from "../lib/params.js";
import { authMiddleware } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Event } from "../models/Event.js";
import { Reservation } from "../models/Reservation.js";
import { Seat } from "../models/Seat.js";
import { bookingSchema, reserveSchema } from "../validators/auth.js";

export const reserveRouter: Router = Router();
export const bookingsRouter: Router = Router();

const RESERVATION_TTL_MS = 10 * 60 * 1000;

reserveRouter.post("/", authMiddleware, async (req, res) => {
  const parsed = reserveSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
    return;
  }

  const { eventId, seatNumbers } = parsed.data;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400).json({ message: "Invalid event id" });
    return;
  }

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const failedSeats: string[] = [];

    for (const seatNumber of seatNumbers) {
      const updated = await Seat.findOneAndUpdate(
        { eventId, seatNumber, status: "available" },
        { status: "reserved" },
        { session, new: true },
      );

      if (!updated) {
        failedSeats.push(seatNumber);
      }
    }

    if (failedSeats.length > 0) {
      await session.abortTransaction();
      res.status(409).json({
        message: "One or more seats are no longer available",
        failedSeats,
      });
      return;
    }

    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);
    const createdReservations = await Reservation.create(
      [{ userId, eventId, seatNumbers, expiresAt }],
      { session },
    );
    const reservation = createdReservations[0];

    if (!reservation) {
      throw new Error("Failed to create reservation");
    }

    await session.commitTransaction();

    res.status(201).json({
      reservationId: reservation._id.toString(),
      expiresAt: expiresAt.toISOString(),
      seatNumbers,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

reserveRouter.get("/:id", authMiddleware, async (req, res) => {
  const id = getRouteParam(req.params.id);
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid reservation id" });
    return;
  }

  const reservation = await Reservation.findById(id).populate(
    "eventId",
    "name date venue",
  );

  if (!reservation) {
    res.status(404).json({ message: "Reservation not found" });
    return;
  }

  if (reservation.userId !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const populatedEvent = reservation.eventId as unknown as {
    _id: mongoose.Types.ObjectId;
    name: string;
    date: Date;
    venue: string;
  };

  if (!populatedEvent?.name) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  res.json({
    _id: reservation._id.toString(),
    userId: reservation.userId,
    eventId: populatedEvent._id.toString(),
    seatNumbers: reservation.seatNumbers,
    expiresAt: reservation.expiresAt.toISOString(),
    event: {
      name: populatedEvent.name,
      date: populatedEvent.date.toISOString(),
      venue: populatedEvent.venue,
    },
  });
});

reserveRouter.delete("/:id", authMiddleware, async (req, res) => {
  const id = getRouteParam(req.params.id);
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid reservation id" });
    return;
  }

  const reservation = await Reservation.findById(id);
  if (!reservation) {
    res.status(404).json({ message: "Reservation not found" });
    return;
  }

  if (reservation.userId !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Seat.updateMany(
      {
        eventId: reservation.eventId,
        seatNumber: { $in: reservation.seatNumbers },
        status: "reserved",
      },
      { status: "available" },
      { session },
    );

    await Reservation.deleteOne({ _id: reservation._id }, { session });
    await session.commitTransaction();

    res.status(204).send();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

bookingsRouter.post("/", authMiddleware, async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
    return;
  }

  const { reservationId } = parsed.data;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    res.status(400).json({ message: "Invalid reservation id" });
    return;
  }

  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    res.status(404).json({ message: "Reservation not found" });
    return;
  }

  if (reservation.userId !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  if (reservation.expiresAt.getTime() <= Date.now()) {
    res.status(410).json({ message: "Reservation expired" });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updateResult = await Seat.updateMany(
      {
        eventId: reservation.eventId,
        seatNumber: { $in: reservation.seatNumbers },
        status: "reserved",
      },
      { status: "booked" },
      { session },
    );

    if (updateResult.modifiedCount !== reservation.seatNumbers.length) {
      await session.abortTransaction();
      res
        .status(409)
        .json({ message: "One or more seats are no longer available" });
      return;
    }

    const bookedAt = new Date();
    const createdBookings = await Booking.create(
      [
        {
          userId,
          eventId: reservation.eventId,
          seatNumbers: reservation.seatNumbers,
          bookedAt,
        },
      ],
      { session },
    );
    const booking = createdBookings[0];

    if (!booking) {
      throw new Error("Failed to create booking");
    }

    await Reservation.deleteOne({ _id: reservation._id }, { session });
    await session.commitTransaction();

    res.status(201).json({
      bookingId: booking._id.toString(),
      eventId: reservation.eventId.toString(),
      seatNumbers: reservation.seatNumbers,
      bookedAt: bookedAt.toISOString(),
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

bookingsRouter.get("/", authMiddleware, async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const bookings = await Booking.find({ userId })
    .sort({ bookedAt: -1 })
    .populate("eventId", "name date venue city category imageUrl");

  const items = bookings
    .map((booking) => {
      const populatedEvent = booking.eventId as unknown as {
        _id: mongoose.Types.ObjectId;
        name: string;
        date: Date;
        venue: string;
        city: string;
        category: string;
        imageUrl?: string;
      };

      if (!populatedEvent?.name) {
        return null;
      }

      return {
        _id: booking._id.toString(),
        eventId: populatedEvent._id.toString(),
        seatNumbers: booking.seatNumbers,
        bookedAt: booking.bookedAt.toISOString(),
        event: {
          name: populatedEvent.name,
          date: populatedEvent.date.toISOString(),
          venue: populatedEvent.venue,
          city: populatedEvent.city,
          category: populatedEvent.category,
          imageUrl: populatedEvent.imageUrl,
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  res.json(items);
});

bookingsRouter.get("/:id", authMiddleware, async (req, res) => {
  const id = getRouteParam(req.params.id);
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid booking id" });
    return;
  }

  const booking = await Booking.findById(id).populate(
    "eventId",
    "name date venue",
  );

  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  if (booking.userId !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const populatedEvent = booking.eventId as unknown as {
    _id: mongoose.Types.ObjectId;
    name: string;
    date: Date;
    venue: string;
  };

  if (!populatedEvent?.name) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  res.json({
    _id: booking._id.toString(),
    eventId: populatedEvent._id.toString(),
    seatNumbers: booking.seatNumbers,
    bookedAt: booking.bookedAt.toISOString(),
    event: {
      name: populatedEvent.name,
      date: populatedEvent.date.toISOString(),
      venue: populatedEvent.venue,
    },
  });
});
