import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    description: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    rating: { type: Number, min: 0, max: 5 },
    amenities: [{ type: String, trim: true }],
    imageUrl: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Hotel =
  mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema);