import { Router } from "express";
import {
  createDestination,
  deleteDestination,
  getDestinationById,
  getDestinations,
  updateDestination,
} from "../controllers/destination.js";

const router = Router();

router.get("/", getDestinations);
router.get("/:id", getDestinationById);
router.post("/", createDestination);
router.put("/:id", updateDestination);
router.delete("/:id", deleteDestination);

export default router;