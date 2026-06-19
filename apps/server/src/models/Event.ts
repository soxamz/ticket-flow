import mongoose, { type InferSchemaType, model, Schema } from "mongoose";

const eventSchema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    city: { type: String, required: true },
    category: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type EventDocument = InferSchemaType<typeof eventSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Event = model("Event", eventSchema);
