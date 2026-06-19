import mongoose from "mongoose";
import { Reservation } from "../models/Reservation.js";
import { Seat } from "../models/Seat.js";

export async function cleanupExpiredReservations(): Promise<void> {
  const now = new Date();
  const expired = await Reservation.find({ expiresAt: { $lte: now } });

  if (expired.length === 0) {
    return;
  }

  for (const reservation of expired) {
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
    } catch (error) {
      await session.abortTransaction();
      console.error("Failed to cleanup reservation", reservation._id, error);
    } finally {
      session.endSession();
    }
  }

  console.log(`Cleaned up ${expired.length} expired reservation(s)`);
}
