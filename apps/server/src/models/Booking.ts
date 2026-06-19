import mongoose, { type InferSchemaType, model, Schema } from "mongoose";

const bookingSchema = new Schema({
  userId: { type: String, required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  seatNumbers: { type: [String], required: true },
  bookedAt: { type: Date, required: true, default: Date.now },
});

export type BookingDocument = InferSchemaType<typeof bookingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Booking = model("Booking", bookingSchema);
