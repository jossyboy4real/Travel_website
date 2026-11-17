import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingType: {
      type: String,
      enum: ["flight", "hotel", "tour"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "USD", trim: true, uppercase: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
