import mongoose, { type InferSchemaType, model, Schema } from "mongoose";

const seatSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  seatNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ["available", "reserved", "booked"],
    default: "available",
  },
});

seatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });

export type SeatDocument = InferSchemaType<typeof seatSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Seat = model("Seat", seatSchema);
