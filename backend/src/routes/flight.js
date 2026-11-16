import { Router } from "express";
import { searchFlights } from "../controllers/flight.js";

const router = Router();

router.post("/search", searchFlights);

export default router;