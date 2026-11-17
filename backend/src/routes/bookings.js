import { Router } from "express";
import {
  createBooking,
  getUserBookings,
} from "../controllers/bookings.js";
import { requireFirebaseAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireFirebaseAuth, getUserBookings);
router.post("/", requireFirebaseAuth, createBooking);

export default router;
