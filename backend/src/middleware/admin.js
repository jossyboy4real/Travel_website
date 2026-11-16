import { User } from "../models/user.js";

export async function requireAdmin(req, res, next) {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid })
      .select("firebaseUid email displayName role")
      .lean();

    if (user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access is required." });
    }

    req.adminUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}