import mongoose, { type InferSchemaType, model, Schema } from "mongoose";

const reservationSchema = new Schema(
  {
    userId: { type: String, required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    seatNumbers: { type: [String], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type ReservationDocument = InferSchemaType<typeof reservationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Reservation = model("Reservation", reservationSchema);
