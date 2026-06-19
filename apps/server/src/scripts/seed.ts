import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../lib/db.js";
import { generateSeatNumbers } from "../lib/seats.js";
import { Event } from "../models/Event.js";
import { Seat } from "../models/Seat.js";

const SAMPLE_EVENTS = [
  {
    name: "Neon Nights Festival",
    date: new Date("2026-08-15T19:00:00.000Z"),
    venue: "Skyline Arena",
    city: "Mumbai",
    category: "Music",
    totalSeats: 30,
    description: "An electrifying night of live music and lights.",
    imageUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=900&fit=crop",
    featured: true,
  },
  {
    name: "Comedy Central Live",
    date: new Date("2026-09-02T20:30:00.000Z"),
    venue: "Laugh Factory",
    city: "Bangalore",
    category: "Comedy",
    totalSeats: 30,
    description: "Stand-up comedy featuring top Indian comedians.",
    imageUrl:
      "https://images.unsplash.com/photo-1585699323561-3dd37a4fa2a3?w=1200&h=900&fit=crop",
    featured: false,
  },
  {
    name: "Indie Film Premiere",
    date: new Date("2026-10-10T18:00:00.000Z"),
    venue: "Cineplex Hall 1",
    city: "Delhi",
    category: "Film",
    totalSeats: 30,
    description: "Exclusive premiere of an award-winning indie film.",
    imageUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede377?w=1200&h=900&fit=crop",
    featured: true,
  },
];

async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await connectDb(uri);

  await Seat.deleteMany({});
  await Event.deleteMany({});

  for (const eventData of SAMPLE_EVENTS) {
    const event = await Event.create(eventData);
    const seatNumbers = generateSeatNumbers(eventData.totalSeats);

    await Seat.insertMany(
      seatNumbers.map((seatNumber) => ({
        eventId: event._id,
        seatNumber,
        status: "available",
      })),
    );

    console.log(
      `Seeded event "${event.name}" with ${seatNumbers.length} seats`,
    );
  }

  await mongoose.disconnect();
  console.log("Seed completed");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
