import { Router } from "express";
import {
  createReview,
  getReviewsForTarget,
} from "../controllers/reviews.js";
import { requireFirebaseAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireFirebaseAuth, createReview);
router.get("/:targetType/:targetId", getReviewsForTarget);

export default router;