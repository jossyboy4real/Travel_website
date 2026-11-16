import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

destinationSchema.index({ name: 1, country: 1 }, { unique: true });

export const Destination =
  mongoose.models.Destination || mongoose.model("Destination", destinationSchema);