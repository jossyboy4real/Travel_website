import { Router } from "express";
import { getDashboard } from "../controllers/admin.js";
import { requireAdmin } from "../middleware/admin.js";
import { requireFirebaseAuth } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", requireFirebaseAuth, requireAdmin, getDashboard);

export default router;