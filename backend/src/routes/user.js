import { Router } from "express";
import { syncCurrentUser } from "../controllers/user.js";
import { requireFirebaseAuth } from "../middleware/auth.js";

const router = Router();

router.post("/sync", requireFirebaseAuth, syncCurrentUser);

export default router;
