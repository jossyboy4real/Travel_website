import { Router } from "express";
import {
  createTour,
  deleteTour,
  getTourById,
  getTours,
  updateTour,
} from "../controllers/tour.js";

const router = Router();

router.get("/", getTours);
router.get("/:id", getTourById);
router.post("/", createTour);
router.put("/:id", updateTour);
router.delete("/:id", deleteTour);

export default router;