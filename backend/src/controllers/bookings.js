import { Booking } from "../models/bookings.js";
import { User } from "../models/user.js";

async function getMongoDbUserId(req) {
  if (req.user?._id) {
    return req.user._id;
  }

  if (!req.user?.uid) {
    return null;
  }

  const user = await User.findOne({ firebaseUid: req.user.uid }).select("_id");
  return user?._id ?? null;
}

export async function createBooking(req, res, next) {
  const { bookingType, title, totalAmount, currency } = req.body ?? {};
  const missingFields = [
    ["bookingType", bookingType],
    ["title", title],
    ["totalAmount", totalAmount],
    ["currency", currency],
  ]
    .filter(([, value]) => value === undefined || value === null || value === "")
    .map(([field]) => field);

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: false,
      message: `Missing required booking fields: ${missingFields.join(", ")}.`,
    });
  }

  try {
    const userId = await getMongoDbUserId(req);
    if (!userId) {
      return res.status(404).json({
        status: false,
        message: "User profile not found. Sync your account before booking.",
      });
    }

    const booking = await Booking.create({
      user: userId,
      bookingType,
      title,
      totalAmount,
      currency,
    });

    return res.status(201).json({ status: true, booking });
  } catch (error) {
    return next(error);
  }
}

export async function getUserBookings(req, res, next) {
  try {
    const userId = await getMongoDbUserId(req);
    if (!userId) {
      return res.status(404).json({
        status: false,
        message: "User profile not found. Sync your account before viewing bookings.",
      });
    }

    const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ status: true, bookings });
  } catch (error) {
    return next(error);
  }
}