import { Router } from "express";
import mongoose from "mongoose";
import { getRouteParam } from "../lib/params.js";
import { Event } from "../models/Event.js";
import { Seat } from "../models/Seat.js";

export const eventsRouter: Router = Router();

async function countAvailableSeats(
  eventId: mongoose.Types.ObjectId,
): Promise<number> {
  return Seat.countDocuments({ eventId, status: "available" });
}

async function getSeatSummary(eventId: mongoose.Types.ObjectId) {
  const [available, reserved, booked] = await Promise.all([
    Seat.countDocuments({ eventId, status: "available" }),
    Seat.countDocuments({ eventId, status: "reserved" }),
    Seat.countDocuments({ eventId, status: "booked" }),
  ]);

  return { available, reserved, booked };
}

eventsRouter.get("/", async (_req, res) => {
  const events = await Event.find().sort({ date: 1 });

  const eventsWithAvailability = await Promise.all(
    events.map(async (event) => {
      const availableSeats = await countAvailableSeats(event._id);
      return {
        _id: event._id.toString(),
        name: event.name,
        date: event.date.toISOString(),
        venue: event.venue,
        city: event.city,
        category: event.category,
        totalSeats: event.totalSeats,
        availableSeats,
        description: event.description,
        imageUrl: event.imageUrl,
        featured: event.featured ?? false,
      };
    }),
  );

  res.json(eventsWithAvailability);
});

eventsRouter.get("/:id", async (req, res) => {
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

  const seatSummary = await getSeatSummary(event._id);
  const availableSeats = seatSummary.available;

  res.json({
    _id: event._id.toString(),
    name: event.name,
    date: event.date.toISOString(),
    venue: event.venue,
    city: event.city,
    category: event.category,
    totalSeats: event.totalSeats,
    availableSeats,
    description: event.description,
    imageUrl: event.imageUrl,
    featured: event.featured ?? false,
    seatSummary,
  });
});

eventsRouter.get("/:id/seats", async (req, res) => {
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
