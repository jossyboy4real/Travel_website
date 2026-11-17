import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { MONGODB_URL, PORT } from "./config/env.js";
import adminRoutes from "./routes/admin.js";
import bookingRoutes from "./routes/bookings.js";
import destinationRoutes from "./routes/destination.js";
import flightRoutes from "./routes/flight.js";
import hotelRoutes from "./routes/hotel.js";
import reviewRoutes from "./routes/reviews.js";
import tourRoutes from "./routes/tour.js";
import userRoutes from "./routes/user.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/flights", flightRoutes);

app.use((error, _req, res, _next) => {
  console.error("Request failed.");
  res.status(500).json({
    error: error.message || "An unexpected server error occurred.",
  });
});

try {
  await mongoose.connect(MONGODB_URL);
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
} catch {
  console.error("Could not connect to MongoDB. Check backend configuration and database availability.");
  process.exit(1);
}